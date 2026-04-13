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
- **네트워크**: `mc-proxy` 외부 Docker 네트워크 (nginx 연결용)

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

## 설정 동기화 주의사항

`COPY_CONFIG_DEST=/data` + `SYNC_SKIP_NEWER_IN_DESTINATION=false` 조합으로
컨테이너 시작 시 `config/`의 내용이 항상 `data/`를 덮어쓴다.
`data/` 직접 수정 후 재시작하면 사라지므로, 영속적 설정은 반드시 `config/`에서 관리한다.

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
