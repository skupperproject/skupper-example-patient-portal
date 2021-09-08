drop table if exists appointments;
drop table if exists appointment_requests;
drop table if exists patients;
drop table if exists doctors;

create table patients (
    id                  serial primary key,
    name                varchar not null,
    zip                 varchar,
    phone               varchar,
    email               varchar
);

create table doctors (
    id                  serial primary key,
    name                varchar not null,
    phone               varchar,
    email               varchar
);

create table appointments (
    id                  serial primary key,
    patient_id          integer not null references patients,
    doctor_id           integer not null references doctors,
    date                date,
    time                time
);

create table appointment_requests (
    id                  serial primary key,
    patient_id          integer not null references patients,
    date                date,
    date_is_approximate boolean not null,
    time_of_day         varchar not null
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

create trigger appointment_requests_changes
after insert or update or delete or truncate on appointment_requests
execute procedure notify_changes();
