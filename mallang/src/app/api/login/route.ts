import { NextResponse } from 'next/server';
import { users, User } from '../../../lib/dataStore'; // Import the shared users array and User interface

// const users: any[] = []; // This line is now irrelevant

export async function POST(request: Request) {
  const { nickname, password } = await request.json();

  // Basic validation
  if (!nickname || !password) {
    return NextResponse.json({ message: 'Nickname and password are required' }, { status: 400 });
  }

  // In a real application, you would query a database here.
  const user = users.find((u: User) => u.nickname === nickname && u.password === password);

  if (user) {
    // In a real application, you would generate a JWT or session token
    return NextResponse.json({ message: 'Login successful', user: { nickname: user.nickname } }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
} 