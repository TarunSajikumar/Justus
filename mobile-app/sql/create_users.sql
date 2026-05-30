-- Drop existing table and create final `users` table

drop table if exists users cascade;

create table users (

id uuid primary key default gen_random_uuid(),

name text,

email text unique,

phone text unique,

relationship_status boolean default false,

relationship_start_date date,

partner_name text,

partner_gender text,

invite_code text unique,

created_at timestamp default now()

);