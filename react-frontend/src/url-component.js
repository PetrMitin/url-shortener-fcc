import React from 'react';

class Url extends React.Component {
    render() {
        if (this.props.error){
            return (
                <div className="url-info">
                    Error: {this.props.error}
                </div>
            )
        }
        return(
            <div className="url-info">
                Short Url: {this.props.shortUrl}<br/>
                Full Url: {this.props.fullUrl}
            </div>
        )
    }
}

export default Url