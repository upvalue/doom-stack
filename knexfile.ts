module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres",
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./migrations",
  },
  timezone: "UTC",
};
