create table patients (
    id     serial primary key,
    name   varchar,
    age    int
);

create or replace function patients_notify() returns trigger as $$
declare
begin
    notify patients;
    return new;
end;
$$ language plpgsql;

create trigger patients_update
after insert or update or delete or truncate on patients
execute procedure patients_notify();
