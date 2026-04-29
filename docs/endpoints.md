# 서버 엔드포인트

## Minecraft 게임 접속

### Java Edition
- **주소**: `minecraft.yourssu.com:25565`
- **프로토콜**: TCP
- **서버 버전**: Paper 1.21.11
- **클라이언트**: Java Edition **1.21.11**

```
minecraft.yourssu.com
```

### Bedrock Edition
- **주소**: `minecraft.yourssu.com:19132`
- **프로토콜**: UDP
- **서버 버전**: Paper 1.21.11 (Geyser 2.9.5 브릿지)
- **클라이언트**: Bedrock Edition **1.21.90** 이상
- **인증**: Floodgate (`.` 접두사 계정으로 서버에 표시)

```
minecraft.yourssu.com
포트: 19132
```

> Bedrock 유저는 서버 내에서 `.원래닉네임` 형태로 표시된다.
> Java 계정과 연동(link)은 비활성화되어 있다.

---

## 웹 엔드포인트

### BlueMap 3D 지도
- **URL**: `https://minecraft.yourssu.com/`
- **설명**: 서버 월드를 3D로 실시간 시각화
- **인증**: 없음 (공개)

### MCSManager 관리 패널
- **URL**: `https://minecraft.yourssu.com/admin/`
- **설명**: 서버 콘솔, 인스턴스 관리, 파일 브라우저
- **인증**: 패널 계정 로그인 필요

MCSManager는 `/admin` 하위 경로에서 동작하도록 패널 설정을 맞춰야 한다.
`mcsmanager-data/web/SystemConfig/config.json`:
```json
{
  "prefix": "/admin",
  "reverseProxyMode": true
}
```

---

## 내부 포트 (서버 로컬 전용)

| 포트 | 서비스 | 바인드 |
|------|--------|--------|
| `25575/tcp` | RCON | `127.0.0.1` |
| `8100/tcp` | BlueMap WebServer | `127.0.0.1` (mc-proxy 네트워크) |
| `23333/tcp` | MCSManager Web | `127.0.0.1` |
| `24444/tcp` | MCSManager Daemon | Docker 내부만 (nginx SSL 프록시로 노출) |

> MCSManager 데몬(24444)은 호스트에 직접 바인딩되지 않는다.
> nginx가 SSL 종단으로 24444를 수신하고 Docker 내부 데몬으로 프록시한다.

---

## 방화벽 요약

```bash
# 필수 개방 포트
sudo ufw allow 25565/tcp   # Java Edition
sudo ufw allow 19132/udp   # Bedrock Edition
sudo ufw allow 80/tcp      # HTTP (certbot 인증용)
sudo ufw allow 443/tcp     # HTTPS (웹 엔드포인트)
sudo ufw allow 24444/tcp   # MCSManager Daemon (브라우저 WebSocket)

# 차단 유지
sudo ufw deny 25575/tcp    # RCON
sudo ufw deny 8100/tcp     # BlueMap (nginx 경유)
sudo ufw deny 23333/tcp    # MCSManager Web (nginx 경유)
```

---

## HTTPS / Certbot 초기 발급

Nginx는 인증서가 없는 상태에서 SSL 설정을 로드하면 시작하지 못한다.
초기 배포는 HTTP 부트스트랩 설정으로 시작한 뒤 인증서를 발급하고, 그 다음 HTTPS 설정으로 전환한다.

1. 부트스트랩 설정으로 Nginx 기동:
   ```bash
   cp deploy/nginx/minecraft.yourssu.com.bootstrap.conf deploy/nginx/minecraft.yourssu.com.conf
   sudo docker compose up -d nginx
   ```

2. 최초 인증서 발급:
   ```bash
   sudo docker compose --profile certbot run --rm certbot-init
   ```

3. HTTPS 설정 활성화:
   ```bash
   cp deploy/nginx/minecraft.yourssu.com.ssl.conf deploy/nginx/minecraft.yourssu.com.conf
   sudo docker compose up -d nginx certbot
   ```

4. 이후 갱신은 `certbot` 서비스가 12시간마다 `certbot renew`를 실행한다.

`LETSENCRYPT_DOMAIN` 기본값은 `minecraft.yourssu.com`이다.
`LETSENCRYPT_EMAIL`을 비워두면 이메일 없이 등록한다.

---

## MCSManager 설정

### 초기 설정

1. `https://minecraft.yourssu.com/admin/` 접속 후 관리자 계정 생성
2. Access Key 확인:
   ```bash
   docker logs mcsmanager-daemon 2>&1 | grep "액세스 키"
   ```

### 데몬 노드 연결 구성

MCSManager는 브라우저가 데몬에 직접 WebSocket 연결해야 콘솔/파일 전송이 동작한다.
따라서 서버 측과 클라이언트 측 연결을 분리하여 구성한다.

| 연결 | 주소 | 설명 |
|------|------|------|
| 서버 (웹 패널 → 데몬) | `ws://mcsmanager-daemon:24444` | Docker 내부 네트워크 |
| 클라이언트 (브라우저 → 데몬) | `wss://minecraft.yourssu.com:24444` | nginx SSL 프록시 경유 |

> **주의**: 노드 설정에서 `ip` 필드에 프로토콜(`wss://`)을 포함하지 않는다.
> MCSManager가 내부적으로 URL을 조합하므로 호스트명만 입력한다.

**노드 설정** (`RemoteServiceConfig`):
```json
{
  "ip": "mcsmanager-daemon",
  "port": 24444,
  "remoteMappings": [
    { "ip": "minecraft.yourssu.com", "port": 24444 }
  ]
}
```

- `ip`: Docker 내부 호스트명 (서버 측 연결용)
- `remoteMappings`: 브라우저가 사용할 외부 주소 (클라이언트 측 연결용)

### Minecraft 서버 Docker 인스턴스

Minecraft 서버는 docker-compose로 관리되는 기존 컨테이너를 MCSManager가 **인계(takeover)** 하는 방식이다.

인계 메커니즘:
1. `minecraft-paper` 컨테이너에 `mcsmanager.instance.uuid` 라벨이 설정됨
2. 데몬 시작 시 해당 라벨을 가진 컨테이너를 자동으로 인계

**docker-compose.yml** (paper 서비스):
```yaml
labels:
  mcsmanager.instance.uuid: "<INSTANCE_UUID>"
```

**인스턴스 설정** (`InstanceConfig/<INSTANCE_UUID>.json`):
```json
{
  "processType": "docker",
  "docker": {
    "containerName": "minecraft-paper",
    "image": "itzg/minecraft-server:java21"
  }
}
```

> docker-compose로 컨테이너를 재생성하면 데몬이 자동으로 재인계한다.
> 시작/중지는 docker-compose로, 콘솔 명령은 MCSManager로 관리한다.
