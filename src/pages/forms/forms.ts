import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import firebase from 'firebase/app';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import { SondagePage } from '../sondage/sondage';
import { AuthProvider } from '../../providers/auth/auth';
import { async } from '../../../node_modules/@firebase/util';
import { User } from '../../models/user';
import { Form } from '../../models/form';
import { FirstTimePage } from '../first-time/first-time';
/**
 * Cette page est la page d'accueil de l'application
 * La page d’accueil donne des informations sur le compte utilisateur. 
 * Les utilisateurs peuvent consulter et répondre aux questionnaires 
 * des entreprises et accéder à leurs formulaires en cliquant 
 * sur l’icône à droite du tableau.
 * Les réponses font l'objet d'une page dédiée nomée Responses
 */


interface Wallet {
  opicoins?: any;

}

interface Response {
  id?: string;
  uid?: string;
  userFormUid?: string;
  formId?: string;
  formTitle?: string;
  nbQuestions?: number;
  rewards?: number;

}
@Component({
  selector: 'page-forms',
  templateUrl: 'forms.html'
})
export class FormsPage {
  formsCollection: AngularFirestoreCollection<Form>;
  forms: Observable<Form[]>;
  responsesCollection: AngularFirestoreCollection<Response>;
  responses: Observable<Response[]>;
  component: FormsPage;
  db: any;
  wallet: Observable<Wallet>
  walletDoc: AngularFirestoreDocument<Wallet>;
  user: User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private auth: AuthProvider,
    private afs: AngularFirestore,
    public httpClient: Http
  ) {

    this.db = firebase.firestore();
    this.user = firebase.auth().currentUser;
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SondagesPage');

    this.formsCollection = this.afs.collection<Form>('forms', ref => ref.where('uid', '==', this.user.uid));
    this.forms = this.formsCollection.valueChanges();

    this.walletDoc = this.afs.doc<Wallet>('wallet/' + this.user.uid);
    this.wallet = this.walletDoc.valueChanges();

    //this.wallet = this.afs.doc<Wallet>('wallet/' + user.uid).valueChanges();
    //IF USER IS CONNECTED FOR THE FIRST TIME --> REDIRECTED TO FIRSTIME PAGE
    /*
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        let userDoc = this.afs.doc(`users/${user.uid}`);
        userDoc.valueChanges().subscribe(data => {
          let userData:User = data;
          if (data == null) { this.auth.updateUserData(user); return this.navCtrl.setRoot(FirstTimePage); }
          if (
            !userData.prenom ||
            !userData.nom ||
            !userData.naissance ||
            !userData.sexe ||
            !userData.rue ||
            !userData.rueNo ||
            !userData.npa ||
            !userData.ville ||
            !userData.canton ||
            !userData.telephone ||
            !userData.naissance
          ) this.navCtrl.setRoot(FirstTimePage);
        });
      }
    })*/

  }
  newForm() {

    let alert = this.alertCtrl.create({
      title: 'Créer un sondage',
      inputs: [
        {
          name: 'formName',
          placeholder: 'Titre du formulaire'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'Annuler',
          handler: data => {

          }
        },
        {
          text: 'Créer',
          handler: data => {
            //VALIDDATION  https://ionicframework.com/docs/api/components/alert/AlertController/
            //CREATION AVEC GOOGLE SCRIPT GOOGLE FORM ET DANS FIRESTORE
            // parametre : id utilisateur, email utilisateur, titre du formulaire
            // créer le formulaire en ajoutant l'utilisateur a editor, met a jour firestore (nom formulaire, id utilisateur, email editeur, date)
            // retourne : true avec le lien du formulaire si reussi sinon erreur avec une alerte
            var user = firebase.auth().currentUser;
            let userId = encodeURI(user.uid);
            let userEmail = encodeURIComponent(user.email);
            var title = encodeURI(data.formName);
            const url = "https://script.google.com/macros/s/AKfycby2tmnvvrN_sEjU2HMw72XKKHSs0qCiCI-blIMvhGf78LG6e9I/exec?";
            const encoded = "uid=" + userId + "&email=" + userEmail + "&title=" + data.formName;
            //const encoded = encodeURIComponent("uid="+this.userId+"&title="+data.formName+"&email"+this.userEmail);
            // console.log(encoded);

            const response = this.httpClient.get(url + encoded).map(res => res).subscribe(data => {

            });

          }
        }
      ]
    });
    alert.present();
  }
  goToForm(form) {
    //console.log(form);
    this.navCtrl.push(SondagePage, { form });

  }

}
