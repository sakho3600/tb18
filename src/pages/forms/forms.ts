import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs/Observable';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import { SondagePage } from '../sondage/sondage';

interface Form {
  date?: Date;
  formId?: string;
  uid?: any;
  editor?: string;
  title?: string;
  statut?: string;
  editUrl?: string;
  publishedUrl?: string;

}
@Component({
  selector: 'page-forms',
  templateUrl: 'forms.html'
})
export class FormsPage {
  formsCollection: AngularFirestoreCollection<Form>;
  forms: Observable<Form[]>;
  userId: any;
  userEmail: any;
  component: FormsPage;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public auth: AuthProvider,
    private afs: AngularFirestore,
    public httpClient: Http
    ) {
    var user = firebase.auth().currentUser;
    this.userId = user.uid;
    this.userEmail = user.email;
    this.formsCollection = afs.collection<Form>('forms', ref => ref.where('uid', '==', this.userId));
    this.forms = this.formsCollection.valueChanges();


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SondagesPage');

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
            console.log('Canceled');
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
            this.userId = encodeURI(user.uid);
            this.userEmail = encodeURIComponent(user.email);
            var title = encodeURI(data.formName);
            const url = "https://script.google.com/macros/s/AKfycby2tmnvvrN_sEjU2HMw72XKKHSs0qCiCI-blIMvhGf78LG6e9I/exec?";
            const encoded = "uid=" + this.userId + "&email=" + this.userEmail + "&title=" + data.formName;
            //const encoded = encodeURIComponent("uid="+this.userId+"&title="+data.formName+"&email"+this.userEmail);
            console.log(encoded);

            const response = this.httpClient.get(url + encoded).map(res => res).subscribe(data => {
              console.log(data);
            });
            console.log(response);

            console.log(data);
          }
        }
      ]
    });
    alert.present();
  }
  goToForm(form) {
    console.log(form);
    this.navCtrl.push(SondagePage, { form });

  }

}
