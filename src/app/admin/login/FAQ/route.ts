import {NextResponse} from 'next/server';
import {db} from ;
export async function POST(request:Request) {
    const {title , description} = await request.json();
    if (!title || !description){
        return NextResponse.json({message: ''});
    }
    try {
        await db.query('INSERT INTO notice(title,description)VALUES(?.?)',[title,description]);
    }

}

export async function GET(params:type) {
    const {title, description, createAt}
    try {
        await db.query('SELECT * FROM notice ORDER BY createAt')
    }
    
    
}

export async function DELETE(params:type) {
    try {
        await db.query('DELETE FROM notice WHERE if = ?');
    }
    
}
export async function PUT(params:type) {
    const {title,description} = await Request.json();
    try {
        await db.query('UPDATE notice SET title= ? , description=? , WHERE id = ?')
    }
    
}