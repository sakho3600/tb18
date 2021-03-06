import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { Http } from '@angular/http';

/**
 * Cette page est un composant qui affiche les réponses auquels 
 * l'utilisateur peuvent répondre sur la page d'accueil
 */

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
  selector: 'page-responses',
  templateUrl: 'responses.html',
})


export class ResponsesPage {

  db: any;
  responsesCollection: AngularFirestoreCollection<Response>;
  responses: Observable<Response[]>;
  formIdUrl: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    private inAppBrowser: InAppBrowser,
    public httpClient: Http
  ) {
    var user = firebase.auth().currentUser;
    this.db = firebase.firestore();
    this.responsesCollection = afs.collection<Response>('user_form_response', ref => ref.where('uid', '==', user.uid).where('isCompleted', '==', false).where('published', '==', true));
    this.responses = this.responsesCollection.valueChanges();
  }

  async createAndGetFormResponse(response) {
    var user = firebase.auth().currentUser;
    let userId = encodeURI(user.uid);
    let formId = encodeURI(response.formId);
    let userFormId = encodeURI(response.userFormUid);
    const url = "https://script.google.com/macros/s/AKfycbzDXRHKxLondFwWqL5ZB1JVdxZsY_tS5OsOs1v5/exec?";
    const encoded = "formId=" + formId + "&uid=" + userId + "&userFormId=" + userFormId;
    console.log(encoded);
    //save responseId to response
    this.httpClient.get(url + encoded).map(res => res).subscribe(data => {
      this.formIdUrl = JSON.parse(data._body);
      this.openWebPage(this.formIdUrl.url);
    });


  }

  openWebPage(url) {
    const options: InAppBrowserOptions = {
      location: 'yes',
      toolbar: 'yes',
      zoom: 'no',
      hardwareback: 'yes',

    }
    const browser = this.inAppBrowser.create(url, '_self', options);
    browser.show();
  }


}
