import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);

    // Crea la tabla automáticamente la primera vez que se ejecuta
    await sql`CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, data JSONB)`;

    if (req.method === 'GET') {
        const rows = await sql`SELECT data FROM app_state WHERE id = 1`;
        return res.status(200).json(rows.length ? rows[0].data : null);
    }

    if (req.method === 'POST') {
        const { projects } = req.body;
        const jsonData = JSON.stringify(projects);
        
        await sql`
            INSERT INTO app_state (id, data) 
            VALUES (1, ${jsonData}::jsonb) 
            ON CONFLICT (id) DO UPDATE SET data = ${jsonData}::jsonb
        `;
        return res.status(200).json({ success: true });
    }

    res.status(405).send('Method Not Allowed');
}
