import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import './App.css';

import Header from './components/header/header.component';
import HomePage from './pages/homepage/homepage.component';
import ShopPage from './pages/shop/shop.component';
import WishlistPage from './pages/wishlist/wishlist.component';
import SignInAndSignUpPage from './pages/sign-in-and-sign-up/sign-in-and-sign-up.component';
import CheckOutPage from './pages/checkout-page/checkout-page.component';
import Footer from './components/footer/footer.component';
import { ToastContainer, Slide } from "react-toastify";

import { auth, createUserProfileDocument, addCollectionAndDocuments } from './firebase/firebase.utils';
import { setCurrentUser } from './redux/user/user.actions';
import { selectCurrentUser } from './redux/user/user.selectors';
import { fetchDirectoryStartAsync } from './redux/directory/directory.actions';
import { selectIsDirectoryFetching } from './redux/directory/directory.selectors';

import { SpinnerOverlay, SpinnerContainer } from './components/with-spinner/with-spinner.styles';

import { selectCollectionsForPreview } from './redux/collections/collections.selectors';

class App extends React.Component {
  // eslint-disable-next-line no-undef
  unsubscribeFromAuth = null;

  componentDidMount() {
    const { setCurrentUser, } = this.props;
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async userAuth => {
      // check if signed in
      if (userAuth) {
        // Get back the userRef obj from our createUserProfileDocument method passing userAuth. If it exists in our db, will bring the data, if not will create a new one.
        const userRef = await createUserProfileDocument(userAuth);
        // subscribe/listen to any changes in userRef data
        userRef.onSnapshot(snapShot => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data()
          });
        });
      } else {
        setCurrentUser(userAuth);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render() {
    return (
      <div className='wrapper'>
        {this.props.isLoading
          ? (<SpinnerOverlay>
            <SpinnerContainer />
          </SpinnerOverlay>)
          : (<React.Fragment>
            <Header />
            <ToastContainer
              autoClose={3000}
              className='toast-container'
              progressClassName='toastProgress'
              bodyClassName='toastBody'
              position='bottom-center'
              transition={Slide}
              newestOnTop
              draggable
              pauseOnHover />
            <Switch>
              <Route exact path='/' component={HomePage} />
              <Route path='/shop' component={ShopPage} />
              <Route path='/wishlist' component={WishlistPage} />
              <Route exact path='/checkout' component={CheckOutPage} />
              <Route
                exact path='/signin'
                render={() =>
                  this.props.currentUser ? (
                    <Redirect to='/' />
                  ) : (
                    <SignInAndSignUpPage />
                  )
                }
              />
            </Switch>
          </React.Fragment>
          )}
        <Footer />
      </div>

    )
  }
}

const mapStateToProps = createStructuredSelector({
  isLoading: selectIsDirectoryFetching,
  currentUser: selectCurrentUser,
});

const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
