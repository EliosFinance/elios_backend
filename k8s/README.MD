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
cd k8s/elios-metrics; helm dependency update; cd ./templates; kubectl apply -f credentials.yaml; kubectl apply -f deployment.yaml; kubectl apply -f ingress.yaml; kubectl apply -f postgres-deployment.yaml; kubectl apply -f redis-client-pod.yaml; kubectl apply -f redis-deployment.yaml; cd ..; kubectl port-forward svc/elios-metrics 3333:3333
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
<br/>
Pour consulter les services :

```sh
kubectl get svc
```
<br/>
<br/>
Pour consulter les ingress (pas encore en état de fonctionnement) :

```sh
kubectl get ingress
```
<br/>
<br/>
Pour redémarrer un service :

```sh
kubectl rollout restart deployment <NOM_DU_SERVICE>
```


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
