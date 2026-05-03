# 코어전 운영 가이드

이 문서는 `config/plugins/Skript/scripts/coregame.sk` 기준의 메인 게임 운영 가이드다.

## 게임 요약

- 게임 방식: 7팀 꼬리잡기 코어전
- 팀: `Red`, `Orange`, `Yellow`, `Green`, `Blue`, `Indigo`, `Purple`
- 승리 조건: 마지막까지 생존한 1팀
- 기본 코어 HP: 200
- 빌드 페이즈: 10분
- 전투장 반경: 320블록
- 코어 보호 반경: 4블록
- 코어 공격 가능 무기: 다이아몬드 검

초기 타겟 체인:

```text
Red -> Orange -> Yellow -> Green -> Blue -> Indigo -> Purple -> Red
```

팀 A가 팀 B의 코어를 파괴하면 A팀의 새 타겟은 B팀이 바라보던 타겟으로 바뀐다. 이미 탈락한 팀은 자동으로 건너뛴다.

## 주요 동작

- `/maingame start` 전에는 월드보더가 적용되지 않는다.
- 게임 시작 시 월드보더가 전투장 중심 기준 지름 640으로 설정된다.
- 게임 중단 또는 종료 시 월드보더는 바닐라 최대 크기로 열린다.
- 빌드 페이즈에는 PvP와 코어 공격이 차단된다.
- 전투 페이즈부터 PvP와 타겟 코어 공격이 가능하다.
- 플레이어가 죽으면 소속 팀 리스폰 위치로 부활한다.
- 팀 탈락, 타겟 변경, 전투 시작, 승리 등 핵심 메시지는 전체 화면 타이틀로 표시된다.

## 운영자 명령어

모든 메인 게임 명령어는 OP 권한이 필요하다.

| 명령어 | 설명 |
|--------|------|
| `/maingame start` | 경기 시작. 빌드 페이즈 진입, 월드보더 활성화 |
| `/maingame stop` | 경기 강제 중단. 월드보더 해제 |
| `/maingame status` | 현재 페이즈, 팀별 생존 여부, 코어 HP, 타겟 확인 |
| `/maingame reset` | 팀 생존 상태, 코어 HP, 타겟 체인 초기화 |
| `/maingame combat` | 테스트/운영용 즉시 전투 페이즈 전환 |
| `/mgteam <player> <team>` | 플레이어를 메인 게임 팀에 배정 |
| `/mgcore <team>` | 바라보는 블록을 해당 팀 코어로 지정 |
| `/mgspawn <team>` | 현재 위치를 해당 팀 리스폰 위치로 지정 |
| `/mgbattleplace` | 현재 위치를 전투장 중심으로 저장 |
| `/mgendplace` | 현재 위치를 경기 종료 후 이동 위치로 저장 |
| `/mghp <team> <number>` | 해당 팀 코어 HP를 강제로 설정 |

팀 이름은 영어 팀명을 사용한다.

```text
Red
Orange
Yellow
Green
Blue
Indigo
Purple
```

대소문자는 구분하지 않는다.

## 경기 전 준비

1. 전투장 중심에서 실행:

   ```text
   /mgbattleplace
   ```

2. 종료 후 모일 위치에서 실행:

   ```text
   /mgendplace
   ```

3. 각 팀 리스폰 위치에서 실행:

   ```text
   /mgspawn Red
   /mgspawn Orange
   /mgspawn Yellow
   /mgspawn Green
   /mgspawn Blue
   /mgspawn Indigo
   /mgspawn Purple
   ```

4. 각 팀 코어 블록을 바라보고 실행:

   ```text
   /mgcore Red
   /mgcore Orange
   /mgcore Yellow
   /mgcore Green
   /mgcore Blue
   /mgcore Indigo
   /mgcore Purple
   ```

5. 플레이어를 팀에 배정:

   ```text
   /mgteam <player> Red
   /mgteam <player> Orange
   ```

## 경기 시작

```text
/maingame start
```

시작 시 자동 처리:

- 팀 scoreboard 생성/색상 보정
- LuckPerms 팀 그룹 생성 보정
- 코어 HP 200으로 초기화
- 생존 상태 초기화
- 타겟 체인 초기화
- 빌드 페이즈 진입
- 월드보더 활성화

10분 후 자동으로 전투 페이즈가 시작된다.

테스트나 운영 판단으로 즉시 전투를 열려면:

```text
/maingame combat
```

## 전투 규칙

코어 공격 조건:

- 게임이 전투 페이즈여야 한다.
- 공격자가 팀에 배정되어 있어야 한다.
- 공격자의 팀이 생존 상태여야 한다.
- 공격 대상 코어가 현재 타겟 팀 코어여야 한다.
- 도구가 다이아몬드 검이어야 한다.

차단되는 행동:

- 빌드 페이즈 코어 공격
- 자기 팀 코어 공격
- 현재 타겟이 아닌 팀 코어 공격
- 다이아몬드 검이 아닌 코어 공격
- 코어 블록 직접 파괴
- 전투장 반경 밖 블록 설치/파괴
- 코어 보호 반경 안 블록 설치/파괴

## 종료

생존 팀이 1팀이 되면 자동 종료된다.

자동 종료 처리:

- 승리팀 공지
- 전체 화면 승리 타이틀 표시
- 월드보더 해제
- 5초 후 `/mgendplace` 위치로 전체 텔레포트

강제 중단:

```text
/maingame stop
```

## 솔로 테스트

OP 상태에서 한 명으로 전체 흐름을 빠르게 확인하는 절차다.

```text
/setnick 테스트
/mgteam <your_real_username> Red
/mgbattleplace
/mgendplace
/mgspawn Red
/maingame start
/maingame combat
```

테스트용으로 Orange 코어를 가까운 블록에 지정하고 HP를 1로 줄인다.

```text
/mgcore Orange
/mghp Orange 1
/give @s diamond_sword
```

다이아몬드 검으로 Orange 코어를 좌클릭한다. 정상이라면 Orange가 탈락하고 Red의 새 타겟이 Yellow로 바뀐다.

같은 방식으로 `Yellow`, `Green`, `Blue`, `Indigo`, `Purple`을 차례로 테스트한다.

```text
/mgcore Yellow
/mghp Yellow 1
```

Purple까지 파괴하면 Red 승리와 종료 텔레포트를 확인할 수 있다.

## 리로드

설정 파일은 `config/`가 영속본이고, 컨테이너 실행 중에는 `data/`의 런타임 복사본도 함께 맞춰야 한다.

```bash
cp config/plugins/Skript/scripts/coregame.sk data/plugins/Skript/scripts/coregame.sk
docker exec minecraft-paper rcon-cli "skript reload coregame"
```

전체 Skript 리로드:

```bash
docker exec minecraft-paper rcon-cli "skript reload scripts"
```
