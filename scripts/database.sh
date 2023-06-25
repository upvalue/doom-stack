#!/bin/bash
# scripts/database.sh
# This script handles running the database, but also runs migrations & seeds

function run_docker_compose() {
    echo "Starting database..."
    docker-compose -f docker-compose.yml up -d
}

function print_docker_output() {
    while IFS= read -r line; do
        echo "[docker] $line"
    done
}

function wait_for_database() {
    echo "[database.sh] Waiting for the database to be connectable..."

    while true; do
        PGPASSWORD="postgres" psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1
        if [[ $? -eq 0 ]]; then
            echo "[database.sh] Database is connectable."
            break
        fi
        sleep 1
    done
}


function migrate_database() {
    echo "[database.sh] Migrating database..."
    wait_for_database
    pnpm knex migrate:latest
    pnpm knex seed:run
}

function drop_database()  {
    echo "[database.sh] Recreating database"
    docker-compose -f docker-compose.yml exec -u postgres postgres /bin/bash -c 'dropdb postgres && createdb postgres'
    migrate_database
    echo "[database.sh] Done recreating database"
}

function print_help_line() {
    echo "Press 'q' to quit, 'm' to migrate the database, 'd' to drop the database"
}

# Run docker-compose and capture the output
run_docker_compose > >(while IFS= read -r line; do
    echo "[docker] $line"
done) 2>&1 &

print_help_line

# Listen for key presses
while true; do
    read -rsn1 input
    case $input in
        q)
            echo "Exiting..."
            # Stop docker-compose and exit the script
            docker-compose -f docker-compose.yml down
            exit 0
            ;;
        m)
            migrate_database
            ;;
        d)
            drop_database
            ;;
    esac
done



