-- Drop existing table and create `otp_codes` table

drop table if exists otp_codes cascade;

create table otp_codes (

id uuid primary key default gen_random_uuid(),

contact text,

otp text,

expires_at timestamp,

verified boolean default false,

created_at timestamp default now()

);