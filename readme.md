# Migrate MySQL
A MySQL migration library inspired by the [`postgres-migrations` package](https://github.com/ThomWright/postgres-migrations) created by Thom Wright.

Migrations are defined in sequential SQL files, for example:
```
migrations
├ 1_create-table.sql
├ 2_alter-table.sql
└ 3_add-index.sql
```

You can integrate this into your project by:
1. Installing `mysql-migrate` as a dependency
```
npm i mysql-migrate --save-dev
```
2. Adding a migration command to your package.json
```
"scripts": {
"db:migrate": "npx mysql-migrate"
}
```

## How it works
1. Checks for DB credentials
2. Checks for DB connectivity
3. Checks for existing migrations table. If this does not exist, it creates one
4. Runs select * from migrations to get a list of already run migrations.
5. Pulls the local migrations from /migrations
6. Compares the results from step #4 & #5, pruning already run migrations from the local migrations list to build a list of migrations to be performed
7. For each migration in said list...
    - Run the migration against the database
    - Adds a record with the given filename and time performed to migrations
8. Migrations complete, end script.

## Design decisions
1. No down migrations
2. Numeric migration ordering

## Contributors
This package was built by [Jim Bisenius](https://github.com/jimmybisenius).