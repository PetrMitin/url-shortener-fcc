import React from 'react';

class Form extends React.Component {
    render() {
        return(
            <div key="shortenerForm" className="input-field">
                <input 
                id="url_input" 
                type="text" 
                name="url" 
                onChange={this.props.handleChange} 
                placeholder="Enter your url"
                className="center-align" 
                autoComplete="off"/>
                <br/>
                <input 
                type="submit" 
                id="submit-url"
                onClick={this.props.createNewUrl} 
                value="Shorten URL" 
                className="btn white-text light-blue accent-2" />
            </div>
        )
    }
}

export default Form;