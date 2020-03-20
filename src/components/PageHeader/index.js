import React     from "react"
import PropTypes from "prop-types"
import { Link, withRouter } from "react-router-dom";
import "./PageHeader.scss"


class PageHeader extends React.Component
{
    static propTypes = {
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        right: PropTypes.element,
        left : PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    };

    static defaultProps = {
        right: null,
        left : null
    };

    render()
    {
        const { title, left, right, history } = this.props;
        return (
            <header className="app-header">
                {
                    left === "back" ?
                    <Link to="#" onClick={() => history.goBack()} className="back-link">
                        <b className="glyphicon glyphicon-chevron-left"/>
                    </Link> :
                    null
                }
                <div className="title">{ title }</div>
                { right || <i/>}
            </header>
        );
    }
}

export default withRouter(PageHeader);
