import { db } from '../db';
import { usersTable } from '../db/userSchema';
import { eq } from 'drizzle-orm';
import Utils from '../utils/common';
import { z } from 'zod';

// Define a User type based on usersTable schema
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// Get all users
export async function getUsers(req: any, res: any) {
  try {
    const users: User[] = await db.select().from(usersTable);
    return res.status(200).json({ data: users });
  } catch (error) {
    console.error('Error getting users from the database: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Register a new user
export async function registerUser(req: any, res: any) {
  try {
    const { name, email, age } = req.body;
    // Validate request body
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userSchema = z.object({
      name: z.string({ required_error: 'Name is required' }).min(2, 'Name must have atleast 2 characters'),
      email: z.string({ required_error: 'Email is required' })
        .regex(emailPattern, 'Invalid email format'),
      age: z.number({ required_error: 'Age is required' })
        .int().positive('Age must be a positive integer'),
    });

    const parseResult = userSchema.safeParse({ name, email, age });
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors.map(e => e.message).join(', ') });
    }

    // Check if user already exists
    const existingUser: User[] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Insert new user
    const [newUser]: User[] = await db
      .insert(usersTable)
      .values({ name, email, age })
      .returning();

    return res.status(201).json({ data: newUser });
  } catch (error) {
    console.error('Error registering user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateUser(req: any, res: any) {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No fields provided in payload' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = Number(id);

    const { name, email, age } = req.body;
    // Check if user exists
    const existingUser: User[] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Build update object with only provided fields
    const updateData: Partial<User> = {};
    if (Utils.isUndefined(name) === false) {
      updateData.name = name;
    }
    if (Utils.isUndefined(email) === false) {
      updateData.email = email;
    }
    if (Utils.isUndefined(age) === false) {
      updateData.age = age;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userSchema = z.object({
      name: z.string().min(2, 'Name must have atleast 2 characters').optional(),
      email: z.string().regex(emailPattern, 'Invalid email format').optional(),
      age: z.number().int().positive('Age must be a positive integer').optional(),
    });

    const keys = Object.keys(updateData)
    let valObject: { [key: string]: any } = {};
    keys.map(item => {
      valObject[item] = updateData[item as keyof User];
    })

    const parseResult = userSchema.safeParse(valObject);
    if (!parseResult.success) {
      console.log('parseResult.error.errors',parseResult.error.errors)
      return res.status(400).json({
        message: parseResult.error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', '),
      });
    }

    console.log('Update data: ', updateData);

    // Update user with only provided fields
    const [updatedUser]: User[] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning();

    return res.status(200).json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete a user
export async function deleteUser(req: any, res: any) {
  try {
    console.log('Deleting user params: ', req.params);
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userId = Number(id);

    // Check if user exists
    const existingUser: User[] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}