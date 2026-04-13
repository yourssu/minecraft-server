# 서버 엔드포인트

## Minecraft 게임 접속

### Java Edition
- **주소**: `minecraft.yourssu.com:25565`
- **프로토콜**: TCP
- **버전**: Java Edition 1.21.11

```
minecraft.yourssu.com
```

### Bedrock Edition
- **주소**: `minecraft.yourssu.com:19132`
- **프로토콜**: UDP
- **버전**: Bedrock Edition (현행 최신)
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

---

## 내부 포트 (서버 로컬 전용)

| 포트 | 서비스 | 바인드 |
|------|--------|--------|
| `25575/tcp` | RCON | `127.0.0.1` |
| `8100/tcp` | BlueMap WebServer | Docker 내부 (`mc-proxy` 네트워크) |
| `23333/tcp` | MCSManager Web | `127.0.0.1` |
| `24444/tcp` | MCSManager Daemon | `127.0.0.1` |

> 내부 포트는 외부에서 직접 접근 불가. nginx 리버스 프록시를 통해서만 노출된다.

---

## 방화벽 요약

```bash
# 필수 개방 포트
sudo ufw allow 25565/tcp   # Java Edition
sudo ufw allow 19132/udp   # Bedrock Edition
sudo ufw allow 80/tcp      # HTTP (certbot 인증용)
sudo ufw allow 443/tcp     # HTTPS (웹 엔드포인트)

# 차단 유지
sudo ufw deny 25575/tcp    # RCON
sudo ufw deny 8100/tcp     # BlueMap (nginx 경유)
sudo ufw deny 23333/tcp    # MCSManager (nginx 경유)
sudo ufw deny 24444/tcp    # MCSManager Daemon
```

---

## MCSManager 초기 설정

1. `https://minecraft.yourssu.com/admin/` 접속 후 관리자 계정 생성
2. **노드** → 새 노드 추가
   - 주소: `mcsmanager-daemon`
   - 포트: `24444`
   - Access Key: 데몬 컨테이너 로그에서 확인
     ```bash
     docker logs mcsmanager-daemon 2>&1 | grep "Access Key"
     ```
3. **인스턴스 생성** → RCON 방식
   - Host: `minecraft-paper`
   - Port: `25575`
   - Password: `.env`의 `RCON_PASSWORD`
