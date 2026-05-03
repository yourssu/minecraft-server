# CLAUDE.md

## 프로젝트 개요

yourssu 동아리 전용 Minecraft 서버 (Paper 1.21.11) 운영 인프라.
Docker Compose 단일 스택으로 구성되며, Bedrock Edition 동시 접속을 지원한다.

## 기술 스택

- **서버 코어**: `itzg/minecraft-server:java21` → Paper 1.21.11
- **Bedrock 브릿지**: Geyser-Spigot + Floodgate (직접 URL 다운로드)
- **지도**: BlueMap 5.x (포트 8100, Paper 내부)
- **관리 패널**: MCSManager v4 (`githubyumao/mcsmanager-web`, `githubyumao/mcsmanager-daemon`)
- **백업**: `itzg/mc-backup` (zstd tar, 12시간 주기)
- **네트워크**: `mc-proxy` 외부 Docker 네트워크 (Nginx 컨테이너 및 서비스 간 연결용)

## 환경 변수

모든 설정은 `.env` 파일로 관리한다. `.env.example` 참고.
민감 값: `RCON_PASSWORD`

## 디렉터리 규칙

| 경로 | 용도 |
|------|------|
| `config/` | 서버 시작 시 `data/`로 복사되는 설정 파일 (`SYNC_SKIP_NEWER_IN_DESTINATION=false`) |
| `data/` | 서버 런타임 데이터 (월드, 플러그인 설정) |
| `extras/` | 컨테이너 내부에서 참조되는 추가 파일 (플러그인 목록 등) |
| `paper-plugins/` | 수동 설치 플러그인 jar |
| `backups/` | 자동 백업 저장소 |
| `docs/` | 운영 문서 |

## 플러그인 관리

- **Modrinth**: `extras/paper-modrinth-plugins.txt` (버전 ID 핀 포함)
- **SpigotMC (Spiget)**: `SPIGET_RESOURCES` 환경변수 (`,` 구분)
- **직접 URL**: `docker-compose.yml`의 `PLUGINS` 환경변수

주요 게임플레이 플러그인:

- **Skript**: 접속 후 닉네임 설정, 팀 배정, 닉네임 기반 명령 resolver, 한국어 사망 메시지
- **DisplayTags + PacketEvents**: 머리 위 커스텀 닉네임 라벨
- **PlaceholderAPI + FoxPapiSkriptExpansion**: DisplayTags가 Skript 변수 `%skript_label.uuid%`를 읽도록 연결
- **EssentialsX + TAB**: 채팅/탭 목록 표시 이름 반영

## 설정 동기화 주의사항

`COPY_CONFIG_DEST=/data` + `SYNC_SKIP_NEWER_IN_DESTINATION=false` 조합으로
컨테이너 시작 시 `config/`의 내용이 항상 `data/`를 덮어쓴다.
`data/` 직접 수정 후 재시작하면 사라지므로, 영속적 설정은 반드시 `config/`에서 관리한다.

## 닉네임 / 팀 / 라벨

- 닉네임 없는 플레이어는 `/setnick <닉네임>` 설정 전까지 채팅, 블록 파괴/설치, 아이템 버리기가 차단된다.
- 일반 플레이어는 `/setnick` 최초 1회만 가능하다. OP는 재설정할 수 있다.
- 닉네임은 UUID 기준 Skript 변수에 저장되고, EssentialsX 닉네임과 TAB 탭 목록 이름에도 적용된다.
- 머리 위 라벨은 DisplayTags가 `%skript_label.uuid%`를 읽어 표시한다. 실제 값은 Skript 변수 `{label::<uuid>}`이다.
- 팀은 numbered vanilla team으로 관리하며 팀당 최대 4명이다.
- `/setteamrandom [player]`는 4명 미만 기존 팀과 새 팀 생성 후보 중 하나를 무작위로 선택한다.
- 일반 플레이어는 `/setteam`, `/setteamrandom`, `/ncmd`를 직접 실행할 수 없다.
- 커맨드 블록 랜덤 팀 배정은 `setteamrandom @p`를 사용한다.
- Shift로 웅크리면 DisplayTags 라벨을 숨기고, 일어서면 다시 표시한다.
- 사망 메시지는 Skript가 상황별 한국어 메시지를 직접 생성해 닉네임을 사용한다.

운영 중 관련 설정만 다시 로드:

```bash
docker exec minecraft-paper rcon-cli "skript reload nickname"
docker exec minecraft-paper rcon-cli "papi reload"
docker exec minecraft-paper rcon-cli "displaytags reload"
```

## 주요 명령

```bash
# 서버 기동 (환경변수 반영 포함)
docker compose up -d

# 콘솔 접근
docker exec minecraft-paper rcon-cli

# 로그 확인
docker compose logs -f paper

# 수동 백업
docker compose exec backups backup now
```

## CI/CD

GitHub Actions + SSH. `.github/workflows/deploy.yml` 참고.
배포 시 `.env`는 GitHub vars(`prod` environment)에서 서버로 생성된다.
