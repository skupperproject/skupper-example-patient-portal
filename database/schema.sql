drop table if exists patients;

create table patients (
    id     serial primary key,
    name   varchar,
    age    int
);

create or replace function notify_changes() returns trigger as $$
declare
begin
    notify changes;
    return new;
end;
$$ language plpgsql;

create trigger patients_changes
after insert or update or delete or truncate on patients
execute procedure notify_changes();
