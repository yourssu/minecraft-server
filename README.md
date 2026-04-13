# yourssu 2026 Minecraft Server

yourssu 동아리 전용 Minecraft 서버. Paper 1.21.11 기반으로 Java · Bedrock 동시 접속을 지원한다.

## 접속 주소

| 클라이언트 | 버전 | 주소 | 포트 |
|-----------|------|------|------|
| Java Edition | **1.21.11** | `minecraft.yourssu.com` | `25565` |
| Bedrock Edition | **1.21.90+** | `minecraft.yourssu.com` | `19132` |
| 지도 (BlueMap) | `https://minecraft.yourssu.com/` | — |
| 관리 패널 | `https://minecraft.yourssu.com/admin/` | — |

## 빠른 시작

```bash
cp .env.example .env
# .env 편집: RCON_PASSWORD, OPS 등 필수 항목 입력

sudo chown -R 1000:1000 data backups paper-plugins
docker compose up -d
```

## 문서

- [엔드포인트](docs/endpoints.md) — 접속 주소, 포트, 방화벽 설정
- [설정 가이드](docs/configuration.md) — 환경 변수, 플러그인 목록, Anti-Xray

## 스택

- **서버**: Paper 1.21.11 on Java 21 (`itzg/minecraft-server:java21`)
- **Bedrock**: Geyser-Spigot + Floodgate
- **지도**: BlueMap 5.x
- **관리**: MCSManager v4
- **백업**: itzg/mc-backup (tar+zstd, 12h)

## 주요 명령

```bash
# 콘솔
docker exec minecraft-paper rcon-cli

# 로그
docker compose logs -f paper

# 수동 백업
docker compose exec backups backup now
```
