drop table if exists patients;
drop table if exists doctors;
drop table if exists appointments;

create table patients (
    id              serial primary key,
    name            varchar not null,
    zip             varchar,
    phone           varchar,
    email           varchar
);

create table doctors (
    id              serial primary key,
    name            varchar not null,
    phone           varchar,
    email           varchar
);

create table appointments (
    id              serial primary key,
    start_time      timestamp,
    end_time        timestamp,
    patient_id      integer references patients,
    doctor_id       integer references doctors
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

create trigger doctors_changes
after insert or update or delete or truncate on doctors
execute procedure notify_changes();

create trigger appointments_changes
after insert or update or delete or truncate on appointments
execute procedure notify_changes();
