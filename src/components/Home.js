import React, { Component } from 'react';
import Logout from './Logout'
import TextBox from './TextBox'
import MovieTvFilter from './MovieTvFilter'
import ResultsContainer from './ResultsContainer'
import ListsContainer from './ListsContainer'
import { Grid, Button, Segment } from 'semantic-ui-react'
import MovieApiAdapter from '../adapters/MovieApiAdapter';
import ShowAdapter from '../adapters/ShowAdapter';
import ListAdapter from '../adapters/ListAdapter';

class Home extends Component {

  constructor(){
    super();
    this.state = {
      input: '',
      selectedFilter: '',
      selectedList: '',
      resultsOnButtonClick: [],
      allLists: [],
      listFriends: []
    }
  }

  setLists = (lists) => {
    this.setState({ allLists: [...lists] })
  }

  setSelectedList = () => {
    this.setState({ selectedList: '' })
  }

  setInput = (newInput) => {
    this.setState({
      input: newInput
    })
  }

  setSelectedFilter = (selected) => {
    this.setState({
      selectedFilter: selected
    })
  }

  setUpcomingReleases = () => {
    this.setState({input: ''})
    this.setState({selectedList: ''})
    MovieApiAdapter.upcomingReleases()
    .then(resp => resp.json())
    .then(json => {
      this.setState({resultsOnButtonClick: json.results})
    })
  }

  setNewReleases = () => {
    this.setState({input: ''})
    this.setState({selectedList: ''})
    MovieApiAdapter.newReleases()
    .then(resp => resp.json())
    .then(json => {
      this.setState({resultsOnButtonClick: json.results})
    })
  }

  setPopularMovies = () => {
    this.setState({input: ''})
    this.setState({selectedList: ''})
    MovieApiAdapter.popularMovies()
    .then(resp => resp.json())
    .then(json => {
      this.setState({resultsOnButtonClick: json.results})
    })
  }

  setListItemsAndUsers = (listName) => {
    this.setState({input: ''})
    this.setState({resultsOnButtonClick: []})
    ListAdapter.listShowsUsers(this.props.loginStatus.userID, listName)
    .then(resp => resp.json())
    .then(json => {
      json.shows.map((show) => {
        if(show.show_type === 'tv'){
          MovieApiAdapter.getTVByID(show.reference_id)
          .then(resp => resp.json())
          .then(json => this.setState({ resultsOnButtonClick: [...this.state.resultsOnButtonClick, json] }))
        } else {
          MovieApiAdapter.getMovieByID(show.reference_id)
          .then(resp => resp.json())
          .then(json => this.setState({ resultsOnButtonClick: [...this.state.resultsOnButtonClick, json] }))
        }
      })
      this.setState({ listFriends: json.users })
    })
  }

  setListItems = (event) => {
    this.setState({selectedList: event.target.innerText})
    this.setState({input: ''})
    this.setState({resultsOnButtonClick: []})

    this.setListItemsAndUsers(event.target.innerText)
  }

  handleListDelete = () => {
    ListAdapter.delete(this.props.loginStatus.userID, this.state.selectedList)
    .then(resp => resp.json())
    .then(json => this.setLists(json))
    this.setNewReleases()
  }

  setFriends = () => {
    this.setState({input: ''})
    this.setState({selectedList: ''})
    window.FB.api(
        `/${this.props.loginStatus.userID}/friends`,
        (response) => {
          if (response && !response.error) {
            this.setState({ resultsOnButtonClick: response.data })
          }
        }
    );
  }

  setListFriends = (listFriends) => {
    this.setState({ listFriends: listFriends})
  }

  componentDidMount(){
    this.setUpcomingReleases()
  }

  render(){
    return(
      <div className="home-page">

        <div className='left-column'>
          <div className='featured-content'>
            <div className='logo-container'>
              <div className="logo">
                <img src="logo_white.svg"/>
              </div>
            </div>
            <div className='featured-links-container'>
                <div className='featured-links-items'>
                    <Button className="upcoming-button" color='grey' onClick={this.setUpcomingReleases}></Button><br/>
                    <Button className="new-releases-button" color='grey' onClick={this.setNewReleases}></Button><br/>
                    <Button className="popular-button" color='grey' onClick={this.setPopularMovies}></Button><br/>
                    <Button className="friends-button" color='grey' onClick={this.setFriends}></Button><br/>
                </div>
            </div>
          </div>
          <div className='lists-user'>
            <div className='lists'>
              <h3>My Lists</h3>
              <ListsContainer
                userID={this.props.loginStatus.userID}
                setLists={this.setLists}
                allLists={this.state.allLists}
                setListItems={this.setListItems}
              />
            </div>
            <div className='user'>
              <div className='user-name-container'>
                <div className='user-name'>
                  {this.props.loginStatus.firstName} {this.props.loginStatus.lastName}
                </div>
              </div>
              <div className='logout-container'>
                <div className='user-image-container'>
                  <img className='user-image' src={this.props.loginStatus.profilePicURL}/>
                </div>
                <div className='logout-button-container'>
                  <div className='logout-button'><Logout /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='right-column'>
          <div className='search'>
            <TextBox setInput={this.setInput}/>
            <MovieTvFilter setSelectedFilter={this.setSelectedFilter}/>
          </div>
          <div className='results'>
            <ResultsContainer
              input={this.state.input}
              currentUser={this.props.loginStatus}
              setListItemsAndUsers={this.setListItemsAndUsers}
              selectedList={this.state.selectedList}
              selectedFilter={this.state.selectedFilter}
              resultsOnButtonClick={this.state.resultsOnButtonClick}
              allLists={this.state.allLists} userID={this.props.loginStatus.userID}
              handleListDelete={this.handleListDelete} listFriends={this.state.listFriends}
              setListFriends={this.setListFriends}
            />
          </div>
        </div>

      </div>
    )
  }
}

export default Home;
