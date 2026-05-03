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
| PacketEvents | DisplayTags 패킷 의존성 |
| DisplayTags | 플레이어 머리 위 닉네임 표시 |
| Skript | 접속 후 닉네임 설정 흐름 |
| FoxPapiSkriptExpansion | Skript 변수를 PlaceholderAPI로 노출 |
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
│   ├── floodgate/
│   │   └── config.yml          # Floodgate 설정 (prefix: ".")
│   ├── DisplayTags/
│   │   └── config.yml          # 머리 위 이름표: %skript_label.uuid%
│   ├── Essentials/
│   │   └── config.yml          # /nick 표시 이름 설정
│   └── Skript/
│       └── scripts/
│           └── nickname.sk     # 접속 후 /setnick 닉네임 설정
└── config/
    └── paper-world-defaults.yml  # Anti-Xray 설정
```

### 설정 동기화 동작

`SYNC_SKIP_NEWER_IN_DESTINATION=false` 설정으로 인해 컨테이너 시작마다
`config/` → `data/` 덮어쓰기가 발생한다.

`data/` 에서 직접 수정한 내용은 재시작 시 사라진다.
**영속적 설정은 반드시 `config/` 에서 관리한다.**

---

## 닉네임 설정

Skript가 `config/plugins/Skript/scripts/nickname.sk`를 로드한다.

- 닉네임이 없는 플레이어는 접속 후 `/setnick <닉네임>`을 입력해야 한다.
- 닉네임을 설정하기 전에는 채팅, 블록 파괴/설치, 아이템 버리기가 차단된다.
- 허용 문자: 한글, 영문, 숫자, `_`
- 길이: 2-16자
- 닉네임은 UUID 기준으로 저장되어 재접속 시 자동 적용된다.
- `/setnick`은 Skript 저장값, EssentialsX 닉네임, TAB 플레이어 목록 이름을 함께 갱신한다.
- `/setnick`은 일반 플레이어 기준 최초 1회만 허용된다. OP는 재설정할 수 있다.
- 머리 위 이름표는 DisplayTags가 `%skript_label.uuid%` 기반으로 표시한다.
- `%skript_label.uuid%`는 FoxPapiSkriptExpansion을 통해 Skript 변수 `{label::%player uuid%}`를 읽는다.
- EssentialsX `nickname-prefix`는 빈 값이고 `max-nick-length`는 16이다.

## 닉네임 명령 실행

Minecraft vanilla command target은 계정 원래 이름을 기준으로 동작한다.
Skript가 닉네임 인덱스를 관리하고, OP/콘솔용 resolver 명령을 제공한다.

- `/realname <nickname>`: 닉네임에 대응되는 원래 계정명을 조회한다.
- `/ncmd <command>`: 명령 인자의 닉네임을 원래 계정명으로 치환한 뒤 콘솔에서 실행한다.
- 예: `/ncmd tp 홍길동 0 80 0` → 닉네임 `홍길동`의 실제 계정명으로 `/tp` 실행.
- 일반 플레이어는 `/ncmd`를 실행할 수 없다.
- `/ncmd` 실행 내역은 서버 로그에는 남지만 일반 non-OP 채팅에는 표시되지 않는다.
- 사망 메시지는 Skript가 상황별 한국어 문구를 직접 생성해서 닉네임을 사용한다.

## 팀 선택

Skript가 필요한 만큼 numbered vanilla team을 생성한다. 팀당 최대 인원은 4명이다.

- 채팅 버튼 UI는 사용하지 않는다.
- 팀은 OP 또는 콘솔/커맨드 블록이 `/setteam <번호> [player]` 또는 `/setteamrandom [player]`로 지정한다.
- 일반 플레이어가 직접 `/setteam`, `/setteamrandom`을 실행하면 거부된다.
- 월드 안의 버튼/커맨드 블록에서 랜덤 팀을 배정하려면 `setteamrandom @p`를 실행한다.
- `/setteamrandom`은 4명 미만인 기존 팀과 새 팀 생성 후보 중 하나를 무작위로 선택한다.
- 새 팀 생성 후보는 모든 기존 팀에 최소 1명 이상 있을 때부터 포함된다.
- 선택한 팀 번호는 UUID 기준으로 저장되어 재접속 시 자동 적용된다.
- 팀 색상은 EssentialsX/TAB 표시 이름에 적용되고, DisplayTags가 머리 위 닉네임 라벨에 같은 색상을 표시한다.
- 플레이어가 Shift로 웅크리면 머리 위 DisplayTags 라벨을 숨기고, 일어서면 다시 표시한다.
- 팀 색상은 팀 번호 기준으로 순환 적용된다.

운영 중 스크립트만 다시 로드:
```bash
docker exec minecraft-paper rcon-cli "skript reload nickname"
```

PlaceholderAPI와 DisplayTags를 수동으로 다시 로드:
```bash
docker exec minecraft-paper rcon-cli "papi reload"
docker exec minecraft-paper rcon-cli "displaytags reload"
```

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
