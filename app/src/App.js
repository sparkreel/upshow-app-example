import React, {Component} from 'react';
import qs from "qs";
import {IframeBridge} from 'wisper-rpc';

import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.name = 'app-impression';
        this.bridge = new IframeBridge(window.parent);
        this.params = qs.parse(window.location.search.slice(1));

        this.app_url = this.getParameter('app_url');
        this.device_code = this.getParameter('device_code');

        this.state = {
            name: null,
            logo: null
        }

        // Method bindings
        this.play = this.play.bind(this);
        this.onReady = this.onReady.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onError = this.onError.bind(this);
    }

    getParameter(key, fallback) {
        const value = this.params[key];
        return value === undefined ? fallback : value;
    }

    getSettingsFromAdmin(){
        const app_key = this.getParameter('app_key');
        return fetch(`${process.env.REACT_APP_ADMIN_URL}/settings?app_key=${app_key}`)
        .then(function(response) {
          return response.json();
        });
    }

    componentDidMount() {
        this.getSettingsFromAdmin()
            .catch(console.error)
            .then(( settings = {}) => {
                const { name, logo } = settings;

                this.setState({name, logo});

                this.bridge.exposeFunction('play', this.play);
                this.onReady();
            });
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    play() {
        this.timeout = setTimeout(() => this.onDone(), this.getParameter('duration', 30) * 1000);
        this.setState({isPlaying: true});
        return true;
    }

    onReady() {
        this.bridge.invoke('onReady')
            .then(result => {
                console.log(`${this.name}: resolve onReady - `, result);
            })
            .catch(error => {
                console.error(`${this.name}: reject onReady - `, error);
            });
    }

    onDone() {
        this.bridge.invoke('onDone')
            .then(result => {
                console.log(`${this.name}: resolve onDone - `, result);
            })
            .catch(error => {
                console.error(`${this.name}: reject onDone - `, error);
            });
    };

    onError(error) {
        this.bridge.invoke('onError', [error])
            .then(() => {
                console.log(`${this.name}: resolve onError`);
            })
            .catch(error => {
                console.error(`${this.name}: reject onError - `, error);
            });
    };

    render() {
        const { name, logo } = this.state;

        return (
            <div className="App">
                {logo && name && <img className="logo" src={logo} alt={name} onLoad={this.onReady} onError={this.onError} />}
                <h3>What is your impression of the service?</h3>
                <h3>Go to {this.app_url} and enter {this.device_code}</h3>
                
            </div>
        );
    }
}

export default App;
