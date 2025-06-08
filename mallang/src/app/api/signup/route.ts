import { NextResponse } from 'next/server';
import { users, User } from '../../../lib/dataStore'; // Import the shared users array and User interface

export async function POST(request: Request) {
  const { nickname, password } = await request.json();

  // Basic validation
  if (!nickname || !password) {
    return NextResponse.json({ message: 'Nickname and password are required' }, { status: 400 });
  }

  // In a real application, you would check if the user already exists in a database.
  if (users.find(u => u.nickname === nickname)) {
    return NextResponse.json({ message: 'Nickname already taken' }, { status: 409 });
  }

  const newUser: User = { nickname, password };
  users.push(newUser);
  console.log('New user signed up:', newUser);
  console.log('Current users in store:', users); // Log all users after adding

  return NextResponse.json({ message: 'Signup successful' }, { status: 201 });
} 