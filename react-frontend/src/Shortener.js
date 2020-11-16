import React from 'react';
import Url from './url-component';
import Form from './Form';
import 'materialize-css';

class Shortener extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            urlToShorten: '',
            isShortened: false,
            shortenedUrlInfo: {
                full_url: '',
                short_url: '',
                error: null
            }
        }
        this.handleChange = this.handleChange.bind(this);
        this.createNewUrl = this.createNewUrl.bind(this);
    }

    handleChange(event) {
        this.setState({urlToShorten: event.target.value});
    }

    async createNewUrl() {
            const url = this.state.urlToShorten;
            const res = await fetch('/new', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({url})
            });
            const jsonRes = await res.json();
            const error = jsonRes.error;
            if (error) {
                return this.setState({isShortened: true, shortenedUrlInfo:{error}})
            }
            this.setState({isShortened: true, shortenedUrlInfo: jsonRes});
    }

    render() {
        let block = this.state.isShortened ? 
        <Url 
        fullUrl={this.state.shortenedUrlInfo.full_url} 
        shortUrl={this.state.shortenedUrlInfo.short_url} 
        error={this.state.shortenedUrlInfo.error} /> 
        : 
        <Form 
        handleChange={this.handleChange} 
        createNewUrl={this.createNewUrl} />;
        
        return(
            <div className="container flow-text">
                <div className="card">
                    <div id="shortener" className="center-align card-content">
                        <h1>Url shortener</h1>
                        {block}
                    </div>
                </div>
            </div>
        )
    }
}

export default Shortener;