# Comment lancer le back sur kube ?

### Pré-requis : 
* Avoir [Helm](https://helm.sh/docs/intro/quickstart/) d'installé sur son pc

* Avoir [Minicube](https://kubernetes.io/fr/docs/tasks/tools/install-minikube/) d'installé sur son pc (instanciation locale de k8s)

* Avoir DockerDeskop d'installé et de lancé



## Lancement du projet :

Lancez un terminal <b>Powershell en mode administrateur</b>, puis lancez cette commande :
```sh
minikube start
```
Quand la commande est terminée, vous pouvez fermer le terminal.

<br/>
<br/>


Dans un terminal à la racine du projet elios_backend, lancez ensuite cette commande :
```sh
cd k8s/elios-metrics; helm repo add bitnami https://charts.bitnami.com/bitnami; helm repo update; helm dependency update; helm dependency build; helm install elios-metrics .; cd ./templates; kubectl apply -f credentials.yaml; kubectl apply -f deployment.yaml; kubectl apply -f ingress.yaml; kubectl apply -f postgres-deployment.yaml; kubectl apply -f redis-client-pod.yaml; kubectl apply -f redis-deployment.yaml; kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml; cd ..; Start-Job { kubectl port-forward service/elios-metrics-grafana 3000:80 -n default }
Start-Job { kubectl port-forward service/elios-metrics 3333:3333 -n default }
```

<b>Et voilà !</b>
Si vous voyez le texte juste en dessous s'afficher, l'API est prête à être utilisée.<br/>
Vous pouvez requêter le backend présent dans le cluster kube via l'url ``http://localhost:3333/`` !
> Forwarding from 127.0.0.1:3333 -> 3333<br/>
Forwarding from [::1]:3333 -> 3333



<br/>
<br/>

## Pour aller plus loin :
<br/>
Pour consulter les logs du backend :

```sh
kubectl get pods
```
```sh
kubectl logs -f elios-metrics-<ID_DU_POD>
```
<br/>
Pour consulter les services :

```sh
kubectl get svc
```
<br/>
Pour consulter les ingress (pas encore en état de fonctionnement) :

```sh
kubectl get ingress
```
<br/>
Pour redémarrer un service :

```sh
kubectl rollout restart deployment <NOM_DU_SERVICE>
```


<br/>
<br/>

## Comment publier une nouvelle version du back vers kube :


```sh
docker login
```
```sh
docker build -t florianplvd1/elios-metrics:latest .
```
```sh
docker push florianplvd1/elios-metrics:latest
```


## Comment accéder aux graph sur grafana : 


Dans un nouveau terminal ``bash``, entrez la commande suivante :
```bash
kubectl get secret elios-metrics-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
Copiez le mot de passe qui sera affiché, puis rendez-vous sur `http://localhost:3000/login`, puis renseignez comme username `admin` et comme mot de passe celui que vous aurez copié.

Bienvenue dans l'interface de grafana !
Afin de maximiser l'exploitation de nos données prometheus, nous allors devoir importer un dashboard qui sera capable d'affichée les graphiques relatifs à nos jeux de données.

### Pour ce faire :
#### Etape 1 :

> Paramètres > Data sources > Add data sources > Prometheus

<br/>

#### Etape 2 : Définir les parametres

> URL : http://elios-metrics-prometheus-server:80

Cliquez ensuite sur save & test tout en bas pour enregistrer. Si vous avez une popup vous disant que la datasource à bien été mise à jour, vous pouvez continuer.

<br/>

#### Etape 3 : Importer le dashboard

Dans la page Dashboards (icones avec 4 carrés)

New > Import
>"Import via grafana.com" = 11159 > Load > prometheus = Prometheus(default) > Import


#### TADA ! 


## Comment accéder à la db de redis : 

```sh
kubectl exec -it redis-client -- redis-cli -h elios-redis
```
