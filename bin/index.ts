import { connect } from "http2";

// Require third-party dependencies
const fs = require(`fs`);
const mysql = require(`mysql2/promise`);
const util = require('util')

const readDir = util.promisify(fs.readdir)
const readFile = (fileName: string) => util.promisify(fs.readFile)(fileName, 'utf8');

console.clear()
console.log('Starting Migrate MySQL...');

(async () => {
    // Checks for DB connectivity
    const connection = await mysql.createConnection({
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'single-my-links',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        database: process.env.DB_DATABASE || 'singlelink'
    })

    // Checks for existing migrations table. If this does not exist, it creates one
    console.log('Checking for migrations table')
    await connection.execute(`
        create table if not exists migrations (
            id serial not null,
            filename varchar(255) not null,
            created_at timestamp default current_timestamp not null,
            UNIQUE (filename)
        );
    `)
    console.log('Migrations table present/created')
    // TODO: Error handling for create migrations table
    // Runs select * from migrations to get a list of already run migrations.
    console.log('Fetching existing migrations')
    const [existingMigrations] = await connection.execute(`
        select * from migrations;
    `)
    let latestMigration: number = 0;
    for(let i=0;i<existingMigrations.length;i++) {
        const dash = existingMigrations[i].filename.indexOf('-')
        const currentMigration = Number(existingMigrations[i].filename.substring(0, dash))
        if(!latestMigration || latestMigration < currentMigration) latestMigration = currentMigration
    }
    // Pulls the local migrations from /migrations
    console.log('Fetching new migrations')
    const localMigrations = await readDir('./migrations')
    let newestMigration: undefined | number = undefined
    for(let i=0;i<localMigrations.length;i++) {
        const dash = localMigrations[i].indexOf('-')
        const currentMigration = Number(localMigrations[i].substring(0, dash))
        if(!newestMigration || newestMigration < currentMigration) newestMigration = currentMigration
    }
    // Compares the results from step #4 & #5, pruning already run migrations from the local migrations list to build a list of migrations to be performed
    if(!newestMigration) throw Error('Uh oh! We couldn\'t find your migrations folder. Check again?')
    if(newestMigration > latestMigration) {
        console.log('New migrations found. Running migrations...')
        // Run each new migration, from oldest added to newest
        for(let i=latestMigration+1;i<=newestMigration;i++) {
            // Find migration with iteration i
            for(let i2=0;i2<localMigrations.length;i++) {
                const dash = localMigrations[i2].indexOf('-')
                const currentMigration = Number(localMigrations[i2].substring(0, dash))
                // If current file is the desired migration
                if(currentMigration === i) {
                    // Execute desired migration
                    const query =  await readFile(`./migrations/${localMigrations[i2]}`)
                    await connection.execute(query)
                    // Add migration to migrations table
                    await connection.execute(`
                    insert into migrations (
                        filename
                    ) values (?)
                `, [localMigrations[i2]])
                console.log(`Migration completed ${localMigrations[i2]} ✅`)
                    // After, end for loop
                    break
                }
                break
            }
        }
    } else {
        console.log('No new migrations have been found. Exiting.')
    }
    // For each migration in said list...
    // Run the migration against the database
    // Adds a record with the given filename and time performed to migrations
    connection.end()
    console.log('Migrations have finished... Goodbye!')
})()