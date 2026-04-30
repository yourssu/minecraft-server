# 서버 설정 가이드

## 환경 변수 (.env)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `TZ` | `Asia/Seoul` | 서버 타임존 |
| `PUID` / `PGID` | `1000` | 컨테이너 실행 유저 ID |
| `MC_MEMORY` | `6G` | JVM 힙 메모리 |
| `MC_PORT` | `25565` | Java Edition 포트 |
| `BEDROCK_PORT` | `19132` | Bedrock Edition UDP 포트 |
| `MC_LEVEL` | `world` | 월드 이름 |
| `MC_MODE` | `survival` | 게임 모드 |
| `MC_DIFFICULTY` | `normal` | 난이도 |
| `MAX_PLAYERS` | `50` | 최대 동시 접속 |
| `VIEW_DISTANCE` | `10` | 시야 거리 (청크) |
| `SIMULATION_DISTANCE` | `10` | 시뮬레이션 거리 (청크) |
| `ONLINE_MODE` | `TRUE` | Mojang 계정 인증 |
| `ENABLE_WHITELIST` | `FALSE` | 화이트리스트 활성화 |
| `ENFORCE_WHITELIST` | `FALSE` | 화이트리스트 강제 적용 |
| `WHITELIST` | `` | 화이트리스트 유저 (`,` 구분) |
| `OPS` | `` | OP 유저 (`,` 구분) |
| `MOTD` | `yourssu 2026` | 서버 목록 표시 문구 |
| `PVP` | `TRUE` | PvP 활성화 |
| `RCON_PASSWORD` | — | **필수 변경**, RCON 비밀번호 |
| `BACKUP_INTERVAL` | `12h` | 자동 백업 주기 |
| `PRUNE_BACKUPS_DAYS` | `7` | 백업 보관 기간 (일) |
| `SPIGET_RESOURCES` | `34315,90766` | SpigotMC 플러그인 ID 목록 |

---

## 플러그인 목록

### Modrinth 자동 설치 (`extras/paper-modrinth-plugins.txt`)

| 플러그인 | 기능 |
|---------|------|
| LuckPerms | 권한/그룹 관리 |
| WorldEdit | 관리자 월드 편집 |
| WorldGuard | 지역 보호 |
| Chunky | 청크 프리젠 |
| PlaceholderAPI | 플러그인 간 변수 연동 |
| GrimAC | 이동/전투 핵 감지 |
| CoreProtect | 블록 로그 및 롤백 |
| EssentialsX | 기본 편의 명령 |
| EssentialsX Spawn | 스폰 제어 |
| EssentialsX Chat | 채팅 포맷 |
| DiscordSRV | Discord 연동 |
| TAB | 탭리스트/네임태그 |
| Multiverse-Core | 멀티월드 |
| Multiverse-Portals | 멀티월드 포탈 |
| BlueMap | 3D 웹 지도 |
| worldguard-extraflags-plus | 지역별 난이도 설정 |
| ViaVersion | 상위 버전 접속 허용 |

### SpigotMC (SPIGET_RESOURCES)

| ID | 플러그인 |
|----|---------|
| `34315` | Vault |
| `90766` | Themis (Bedrock 안티치트) |

### 직접 URL (docker-compose.yml `PLUGINS`)

- Geyser-Spigot (최신 빌드)
- Floodgate-Spigot (최신 빌드)

---

## 설정 파일 구조

```
config/
├── plugins/
│   ├── Geyser-Spigot/
│   │   └── config.yml          # Geyser 설정 (auth-type: floodgate)
│   └── floodgate/
│       └── config.yml          # Floodgate 설정 (prefix: ".")
└── config/
    └── paper-world-defaults.yml  # Anti-Xray 설정
```

### 설정 동기화 동작

`SYNC_SKIP_NEWER_IN_DESTINATION=false` 설정으로 인해 컨테이너 시작마다
`config/` → `data/` 덮어쓰기가 발생한다.

`data/` 에서 직접 수정한 내용은 재시작 시 사라진다.
**영속적 설정은 반드시 `config/` 에서 관리한다.**

---

## Geyser / Bedrock 설정

- **auth-type**: `floodgate` — Bedrock 플레이어는 Mojang 인증 없이 접속
- **Floodgate prefix**: `.` — Bedrock 유저명 앞에 `.` 붙음
- **player-link**: 비활성화 (Java-Bedrock 계정 연동 없음)
- **TAB scoreboard-teams**: Bedrock 유저 자동 제외 (`%bedrock%=true`)
- **LuckPerms**: `allow-invalid-usernames: true` (`.` 포함 유저명 허용)

---

## Anti-Xray 설정

| 월드 | Engine Mode | 비고 |
|------|-------------|------|
| `world` (오버월드) | 2 | 가짜 광물 생성 |
| `world_nether` | 2 | `ancient_debris`, `nether_gold_ore`, `nether_quartz_ore` |
| `world_the_end` | 비활성화 | — |

---

## BlueMap

- **포트**: 8100 (컨테이너 내부, mc-proxy 네트워크)
- **웹 접근**: `https://minecraft.yourssu.com/`
- **리소스 다운로드**: `data/plugins/BlueMap/core.conf` → `accept-download: true`
- **렌더 스레드**: `render-thread-count: 2`

청크 프리젠 후 BlueMap 렌더링:
```bash
docker exec minecraft-paper rcon-cli "chunky radius 3000"
docker exec minecraft-paper rcon-cli "chunky start"
```

---

## 백업

- **방식**: `tar + zstd` 압축
- **저장 위치**: `./backups/`
- **주기**: 12시간 (변경: `BACKUP_INTERVAL`)
- **보관**: 7일 (변경: `PRUNE_BACKUPS_DAYS`)
- **latest 심링크**: `backups/latest` → 최근 백업

수동 백업:
```bash
docker compose exec backups backup now
```
