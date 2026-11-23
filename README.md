# SimRacing Championship Manager

Aplikasi web untuk mengelola kejuaraan sim racing, termasuk driver, mobil, sirkuit, jadwal race, peserta, dan hasil. Frontend dibuat dengan React + Vite, sedangkan backend NestJS menyediakan REST API CRUD untuk jadwal race.

## Running

```powershell
npm install
Set-Location backend
npm install
npm run start:dev
```

```powershell
npm run dev
```

## Tahapan dan screenshot

Screenshot instalasi, resource, dan backend berjalan:

1. **Instalasi** — versi Node.js, npm, Nest CLI, dan dependency backend: ![Tahap instalasi](docs/screenshots/01-installasi.png).
2. **Resource Race** — struktur entity, DTO, controller, dan service: ![Resource Race](docs/screenshots/02-resource-races.png).
3. **Backend berjalan** — server NestJS aktif: ![Backend berjalan](docs/screenshots/03-backend-berjalan.png).

Request backend diuji pakai REST Client di `backend/test/races.http`.

### 1. Menampilkan daftar race (GET)

Backend mengembalikan seluruh jadwal race dan frontend menampilkan daftar yang sama.

| Backend | Frontend |
| --- | --- |
| ![GET semua race di backend](docs/screenshots/get-all-backend.png) | ![Daftar race di frontend](docs/screenshots/get-all-front-end.png) |

### 2. Menambahkan race (POST)

Backend membuat jadwal baru: race/jadwal yang tadi di post akan muncul di daftar frontend. 

| Backend | Frontend |
| --- | --- |
| ![POST race di backend](docs/screenshots/add-back-end.png) | ![Race baru di frontend](docs/screenshots/add-front-end.png) |

### 3. Mengubah race (PATCH)

Backend menyimpan perubahan race dan frontend menampilkan data yang sudah diperbarui.

| Backend | Frontend |
| --- | --- |
| ![PATCH race di backend](docs/screenshots/update-back-end.png) | ![Race yang diperbarui di frontend](docs/screenshots/update-front-end.png) |

### 4. Menghapus race (DELETE)

Backend menghapus race dan frontend memperbarui daftar tanpa race tersebut.

| Backend | Frontend |
| --- | --- |
| ![DELETE race di backend](docs/screenshots/delete-back-end.png) | ![Daftar frontend setelah race dihapus](docs/screenshots/delete-front-end.png) |
