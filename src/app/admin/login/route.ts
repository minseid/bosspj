//로그인

import { users } from '@/lib/dataStore';
import {NextResponse} from 'next/server';

export async function POST(request:Request) {
    const {email, password} = await request.json();
    if(!email || !password){
        return NextResponse.json({massage : '이메일 및 패스워드를 입력시주세요.'})
    
    }
    const user = users.find((u:User)=>u.email===email && u.password===password);
    
    
}