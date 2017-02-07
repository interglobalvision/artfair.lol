import React, { Component } from 'react';

import { distanceFrom } from '/imports/lib/geometry.js';

import sanitizeHtml from 'sanitize-html';

import { addPost } from '/imports/api/photosMethods.js';

import { LocationNotice } from '/imports/components/posts/LocationNotice.jsx';

export class NewPost extends Component {
  constructor(props) {
    super(props);

    let photo = Session.get('newPhoto');
    let fingerprint = Session.get('fingerprint');

    if(photo === undefined) {
      FlowRouter.go('home');
    }

    this.state = {
      photo,
      fingerprint,
      locationApproved: false,
      locationChecking: true,
      uploading: false
    };

    this.checkGeofence = this.checkGeofence.bind(this);

    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentWillMount() {

    navigator.geolocation.getCurrentPosition(this.checkGeofence);

  }

  checkGeofence(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    let fenceMatch = _.find(Meteor.settings.public.geofences, function(fence) {
      let distance = distanceFrom({
        'lat1': latitude,
        'lng1': longitude,
        'lat2': fence.latitude,
        'lng2': fence.longitude
      });

      if (distance <= (fence.radius / 1000)) {
        return true;
      } else {
        return false;
      }

    });

    this.setState({
      'locationChecking': false
    });

    if (fenceMatch) {
      this.setState({
        'locationApproved': true,
        'location': fenceMatch.name
      });
    } else {
      this.setState({
        'locationApproved': false
      });
    }

  }

  getSlingshotUploader() {
    return new Slingshot.Upload('imageUpload');
  }

  uploadFile() {
    uploader = this.getSlingshotUploader();
    const photo = this.state.photo;

    this.setState({
      'uploading': true
    });

    this.progressBarStyle = {
      width: '0%'
    };

    let progress = 0;

    this.timer = setInterval(() => {
      if(!isNaN(uploader.progress())) {
        progress = Math.ceil(uploader.progress() * 100);
      }

      this.setState({progress: progress});
      this.progressBarStyle = {
        width: progress + '%'
      };

      if (this.state.progress === 100) {
        clearInterval(this.timer);
      }
    }, 100);

    // Use fetch to convert base64 to blob
    fetch(photo)
      .then( res => res.blob() )
      .then( blob => {
        uploader.send(blob, this.handleUpload);
      });
  }

  handleUpload(error, url) {
    const caption = this.state.caption;
    const fingerprint = this.state.fingerprint;
    const location = this.state.location;

    if (error) {
      console.log(error);
      throw new Meteor.Error('upload-file-fail', error);

    } else {

      addPost.call({
        caption,
        photo: url,
        fingerprint,
        location
      }, (err, res) => {
        if (err) {
          console.log(err);
        }

        this.setState({
          'uploading': false
        });

        clearInterval(this.timer);

        Session.set('feedTimestamp', new Date());

        FlowRouter.go('home');

      });

    }
  }

  disableElem() {
    if (this.state.locationChecking || !this.state.locationApproved || this.state.uploading) {
      return true;
    }

    return false;
  }

  onInputChange(event) {
    this.setState({caption: event.target.value});
  }

  onSubmitForm(event) {
    event.preventDefault();

    if (this.state.locationApproved) {
      this.uploadFile();
    }

    return false;
  }

  render() {
    return (
      <section>
        <LocationNotice checking={this.state.locationChecking} approved={this.state.locationApproved} location={this.state.location} />

        <div className="grid-row margin-bottom-small">
          <div className="grid-item item-s-12 no-gutter grid-row justify-center align-items-center">
            <img className="post-image" src={this.state.photo} />
          </div>
        </div>
        <form onSubmit={this.onSubmitForm}>
          <textarea className="comment-textarea margin-bottom-small" placeholder="Add a caption" value={this.state.caption} onChange={this.onInputChange} />
          <div className="grid-row margin-bottom-basic">
            <div className="grid-item item-s-12 text-align-center">
              <input className='button font-size-mid' type="submit" value="POST" disabled={this.disableElem()} />
            </div>
          </div>
        </form>
        {this.state.uploading &&
          <div id="upload-progress-holder" className="grid-row justify-center align-items-center">
            <div id="upload-progress-bar" style={this.progressBarStyle}></div>
            <div className="grid-item item-s-12 no-gutter text-align-center font-bold">{this.state.progress}%</div>
          </div>
        }
      </section>
    );
  }
};
