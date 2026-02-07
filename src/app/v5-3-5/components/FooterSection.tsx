import React from 'react';

export default function FooterSection() {
    return (
        <footer>
            <div className="transparent">
                <div>
                    <div className="container white-text">
                        <div className="section" style={{ padding: '20px 0' }}>
                            <div className="row">
                                <div className="col s12 center">
                                    <label style={{ fontSize: '0.8rem' }}>
                                        <a href="privacy.html" spa="true">
                                            <label>Política de Privacidade</label>
                                        </a>
                                    </label>
                                    <br />
                                    <label style={{ fontSize: '0.75rem' }}>Copyright 2026 © by Axis Protocol Studio<br />All right reserved.</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="black"></div>
        </footer>
    );
}
