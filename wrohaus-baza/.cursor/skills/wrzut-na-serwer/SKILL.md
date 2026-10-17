---
name: wrzut-na-serwer
description: Deploys SOFELIO to the VPS with the existing automated package (wrzuc-na-vps.cmd), same flow as OF. Use when the user says wrzucamy to na serwer, wrzuć na VPS, wrzuc na serwer, wrzuć paczkę, deploy na serwer, or asks to upload/reset production.
---

# Wrzut na serwer (SOFELIO)

Nie wymyślaj nowego deployu. Odpal gotowe skrypty.

## Kiedy co

| Sytuacja | Skrypt |
|---|---|
| Normalny wrzut | `wrzuc-na-vps.cmd` |
| Paczka już na VPS, 502, urwane po PM2 | `dokoncz-na-vps.cmd` |

## Jak odpalić

Z katalogu projektu, z uprawnieniami nieograniczonymi (SSH + hasło usera), `block_until_ms` min. 300000 (5 min):

```bat
cd /d C:\Users\48661\sofelio
wrzuc-na-vps.cmd
```

User wpisuje hasło root (2 razy przy pełnym wrzucie). Czekaj aż wróci `GOTOWE`.

## Sukces

Musi być w logu:

```
OK: aplikacja dziala na porcie 3000
GOTOWE
```

Sam `pm2 stop` / `pm2 delete` i koniec = **porażka**. Wtedy `dokoncz-na-vps.cmd`.

## Nie rób

- własnych one-linerów SSH z `pkill -f 'next start'`
- `npm ci` przy `NODE_ENV=production` bez `--include=dev`
- `pack.ps1` + ręczny scp zamiast `wrzuc-na-vps.cmd`
- kasowania `/var/www/sofelio/data` (zamówienia)
