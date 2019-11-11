import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

import api from '../../services/api';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    await this.loadStars();
  }

  loadStars = async (page = 1) => {
    const { navigation } = this.props;
    const { stars } = this.state;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    await this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      loading: false,
      page,
      refreshing: false,
    });
  };

  loadMore = async () => {
    const { page } = this.state;
    const nextPage = page + 1;
    await this.loadStars(nextPage);
  };

  refreshList = async () => {
    this.setState({ page: 1, refreshing: true });
    const nextPage = 1;

    await this.loadStars(nextPage);
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user && user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading && <ActivityIndicator color="#7159c1" />}
        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item, index }) => (
            <Starred>
              <OwnerAvatar
                source={{ uri: item.owner && item.owner.avatar_url }}
              />
              <Info>
                <Title>
                  {index + 1} - {item.name}
                </Title>
                <Author>{item.owner && item.owner.login}</Author>
              </Info>
            </Starred>
          )}
          onRefresh={this.refreshList}
          refreshing={refreshing}
          onEndReachedThreshold={0.01}
          onEndReached={this.loadMore}
        />
      </Container>
    );
  }
}
