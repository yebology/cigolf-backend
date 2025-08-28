CREATE TYPE prioritas AS ENUM (
	'P1',
	'P2',
	'P3',
	'P4',
	'P5');

CREATE TABLE role (
	id SERIAL NOT NULL,
	role varchar(255) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT role_pkey PRIMARY KEY (id)
);

CREATE TABLE users (
	id SERIAL NOT NULL,
	username varchar(50) NOT NULL,
	password_hash text NOT NULL,
	nama varchar(255) NOT NULL,
	id_role INT NOT NULL,
	no_telp varchar(255) NOT NULL,
	email varchar(100) NOT NULL,
	is_active BOOLEAN DEFAULT true NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE region (
	id SERIAL NOT NULL,
	region varchar(255) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT region_pkey PRIMARY KEY (id)
);

CREATE TABLE divisi (
	id SERIAL NOT NULL,
	divisi varchar(255) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT divisi_pkey PRIMARY KEY (id)
);

CREATE TABLE lokasi (
	id SERIAL NOT NULL,
	lokasi varchar(255) NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT lokasi_pkey PRIMARY KEY (id)
);

CREATE TABLE mandor (
	id SERIAL NOT NULL,
	id_user INT NOT NULL,
	id_region INT NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT mandor_pkey PRIMARY KEY (id)
);

CREATE TABLE bridge_laphar_hardet (
	id SERIAL NOT NULL,
	id_laphar INT NULL,
	id_hardet INT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT bridge_laphar_hardet_pkey PRIMARY KEY (id)
);

CREATE TABLE harian_detail (
	id SERIAL NOT NULL,
	id_mingdet INT NULL,
	title text NOT NULL,
	id_lokasi INT NOT NULL,
	id_divisi INT NOT NULL,
	prioritas prioritas DEFAULT 'P3' NOT NULL,
	hole varchar(255) NULL,
	tk_butuh INT NULL,
	tk_tersedia INT NULL,
	nama_tk text NULL,
	keterangan text NULL,
	url_foto text NULL,
	is_done BOOLEAN DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT harian_detail_pkey PRIMARY KEY (id)
);

CREATE TABLE laporan_harian (
	id SERIAL NOT NULL,
	id_mandor INT NOT NULL,
	tanggal date DEFAULT now() NOT NULL,
	id_region INT NOT NULL,
	is_approved BOOLEAN DEFAULT false NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT laporan_harian_pkey PRIMARY KEY (id)
);

CREATE TABLE laporan_mingguan (
	id SERIAL NOT NULL,
	title text NOT NULL,
	tanggal_mulai date NOT NULL,
	tanggal_selesai date NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT laporan_mingguan_pkey PRIMARY KEY (id)
);

CREATE TABLE minggu_detail (
	id SERIAL NOT NULL,
	title text NOT NULL,
	id_lokasi INT NOT NULL,
	id_divisi INT NOT NULL,
	prioritas prioritas DEFAULT 'P3' NOT NULL,
	tanggal_mulai date DEFAULT now() NULL,
	hole varchar(255) NULL,
	keterangan text NULL,
	is_done BOOLEAN DEFAULT false NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT minggu_detail_pkey PRIMARY KEY (id)
);

CREATE TABLE bridge_lapming_mingdet (
	id SERIAL NOT NULL,
	id_lapming INT NULL,
	id_mingdet INT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT bridge_lapming_mingdet_pkey PRIMARY KEY (id)
);

ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (id_role) REFERENCES role(id) ON UPDATE CASCADE;

ALTER TABLE mandor ADD CONSTRAINT fk_mandor_region FOREIGN KEY (id_region) REFERENCES region(id);
ALTER TABLE mandor ADD CONSTRAINT fk_mandor_users FOREIGN KEY (id_user) REFERENCES users(id) ON UPDATE CASCADE;

ALTER TABLE minggu_detail ADD CONSTRAINT fk_mingdet_divisi FOREIGN KEY (id_divisi) REFERENCES divisi(id);
ALTER TABLE minggu_detail ADD CONSTRAINT fk_mingdet_lokasi FOREIGN KEY (id_lokasi) REFERENCES lokasi(id);

ALTER TABLE bridge_lapming_mingdet ADD CONSTRAINT fk_bridgeming_lapming FOREIGN KEY (id_lapming) REFERENCES laporan_mingguan(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE bridge_lapming_mingdet ADD CONSTRAINT fk_bridgeming_mingdet FOREIGN KEY (id_mingdet) REFERENCES minggu_detail(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE bridge_laphar_hardet ADD CONSTRAINT fk_bridgehar_hardet FOREIGN KEY (id_hardet) REFERENCES harian_detail(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE bridge_laphar_hardet ADD CONSTRAINT fk_bridgehar_laphar FOREIGN KEY (id_laphar) REFERENCES laporan_harian(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE harian_detail ADD CONSTRAINT fk_hardet_divisi FOREIGN KEY (id_divisi) REFERENCES divisi(id) ON UPDATE CASCADE;
ALTER TABLE harian_detail ADD CONSTRAINT fk_hardet_lokasi FOREIGN KEY (id_lokasi) REFERENCES lokasi(id) ON UPDATE CASCADE;
ALTER TABLE harian_detail ADD CONSTRAINT fk_hardet_mingdet FOREIGN KEY (id_mingdet) REFERENCES minggu_detail(id) ON UPDATE CASCADE;

ALTER TABLE laporan_harian ADD CONSTRAINT fk_laphar_mandor FOREIGN KEY (id_mandor) REFERENCES mandor(id) ON UPDATE CASCADE;
ALTER TABLE laporan_harian ADD CONSTRAINT fk_laphar_region FOREIGN KEY (id_region) REFERENCES region(id);
