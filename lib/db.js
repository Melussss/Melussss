export function database(env){if(!env.DB)throw new Error('Database is not configured');return env.DB;}
