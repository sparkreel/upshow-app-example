import React, { Component } from 'react';
import qs from "qs";

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            submited: false
        }

        this.params = qs.parse(window.location.search.slice(1));
    }

    getParameter(key, fallback) {
        const value = this.params[key];
        return value === undefined ? fallback : value;
    }

    onSubmit(e) {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_ADMIN_URL}/impression`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({impression: e.target.impression.value, app_key: e.target.app_key.value})
        }).then( () => {
            this.setState({submited: true})
        });
    }

    render() {
        const { submited } = this.state;

        const app_key = this.getParameter('app_key');

        return !submited ? <div className="ImpressionSurvey">
                {app_key &&
                    <div className="card-panel row" >
                        <h5 className="row" >What is your impression of the service?</h5>
                        <form className="col s12" method="post" onSubmit={ (e) => this.onSubmit(e)} ref={ ef => this.form = ef } >
                            <div className="row">
                                <label className="col m12">
                                    <span className="col m6">Excellent</span>
                                    <input type="radio" name="impression" value="Excellent" style={{opacity: 1}} ></input>
                                </label>
                            </div>
                            <div className="row">
                                <label className="col m12">
                                    <span className="col m6">Good</span>
                                    <input type="radio" name="impression" value="Good" style={{opacity: 1}} ></input>
                                </label>
                            </div>
                            <div className="row">
                                <label className="col m12">
                                    <span className="col m6">Bad</span>
                                    <input type="radio" name="impression" value="Bad" style={{opacity: 1}} ></input>
                                </label>
                            </div>

                            <input id="app_key" name="app_key" type="hidden" value={app_key} />

                            <div className="row">
                                <button className="btn waves-effect waves-light indigo col s2 offset-s2" type="submit" name="action">Send
                                    <i className="material-icons left">send</i>
                                </button>
                            </div>
                        </form>
                    </div>
                }
                {!app_key &&
                    <div className="card-panel row">
                        <h5 className="col s10 offset-s2" ><span>⚠</span>️ No app key provided - Please contact support</h5>
                    </div>
                }
            </div> 
            : 
            <div className="ThanksYou">
                <div className="card-panel row">
                    <h5 className="col s10 offset-s2" >Thanks You!</h5>
                </div>
            </div>;
    }
}

export default App;
