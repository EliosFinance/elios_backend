# Système d'authentification par PIN

## Flux d'utilisation

1. **L'utilisateur se connecte normalement** avec son email/mot de passe et reçoit un token JWT.
2. **Configuration du PIN** par l'utilisateur (une seule fois).
3. **Utilisation normale de l'application** avec le token JWT.
4. **L'utilisateur ferme l'application** - cet événement est enregistré via l'endpoint `/auth/app/close`.
5. **L'utilisateur rouvre l'application** - l'application fait une demande à `/auth/app/open` qui vérifie si l'utilisateur doit entrer son PIN (si l'app a été fermée).
6. **Vérification du PIN** - si nécessaire, l'utilisateur doit entrer son PIN via `/auth/pin/verify` pour continuer à utiliser l'application avec son token existant.
7. **En cas d'échec répété** (3 tentatives par défaut), les tokens sont invalidés et l'utilisateur doit se reconnecter complètement.


### Première connexion
1. L'utilisateur se connecte normalement via `/auth/sign-in`
2. Vérifiez si un PIN est déjà configuré via `GET /auth/pin/status`
3. Si non configuré, demandez à l'utilisateur de configurer un PIN via `POST /auth/pin/setup`
4. Générez un ID d'appareil via `POST /auth/pin/generate-device` et stockez-le localement

### Utilisation normale
1. Envoyez périodiquement des requêtes `POST /auth/app/keep-alive` pour maintenir l'état actif
2. Lorsque l'utilisateur ferme l'application, appelez `POST /auth/app/close`

### Retour sur l'application
1. Lorsque l'utilisateur rouvre l'application, appelez `POST /auth/app/open` avec l'ID d'appareil
2. Si `requiresPin` est `true` dans la réponse, demandez à l'utilisateur d'entrer son PIN
3. Vérifiez le PIN via `POST /auth/pin/verify`
4. Si la vérification réussit, l'utilisateur peut continuer à utiliser l'application avec son token existant
5. Si la vérification échoue 3 fois, le token est invalidé et l'utilisateur doit se reconnecter complètement

## A Savoir
1. Si vous avez une question demander a Louis.
2. Une collection POSTMAN est en cours de creation avec tous les endpoints API
3. Un swagger est egalement disponible avec tout ce dont vous avez besoin
