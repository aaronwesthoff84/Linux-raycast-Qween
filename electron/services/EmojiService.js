class EmojiService {
  constructor() {
    this.emojiList = this.buildEmojiList();
  }

  buildEmojiList() {
    const emojiData = [
      { emoji: '😀', name: 'grinning_face', category: 'smileys', tags: ['smile', 'happy', 'face'] },
      { emoji: '😃', name: 'grinning_face_big_eyes', category: 'smileys', tags: ['smile', 'happy', 'face'] },
      { emoji: '😄', name: 'grinning_face_smiling_eyes', category: 'smileys', tags: ['smile', 'happy', 'face'] },
      { emoji: '😁', name: 'beaming_face_smiling_eyes', category: 'smileys', tags: ['smile', 'happy', 'face'] },
      { emoji: '😆', name: 'grinning_squinting_face', category: 'smileys', tags: ['smile', 'happy', 'face'] },
      { emoji: '😂', name: 'face_tears_joy', category: 'smileys', tags: ['laugh', 'cry', 'happy'] },
      { emoji: '🤣', name: 'rolling_floor_laughing', category: 'smileys', tags: ['laugh', 'lol'] },
      { emoji: '😊', name: 'smiling_face_smiling_eyes', category: 'smileys', tags: ['smile', 'happy', 'blush'] },
      { emoji: '😍', name: 'smiling_face_heart_eyes', category: 'smileys', tags: ['love', 'heart', 'crush'] },
      { emoji: '😘', name: 'face_blowing_kiss', category: 'smileys', tags: ['kiss', 'love'] },
      { emoji: '😎', name: 'smiling_face_sunglasses', category: 'smileys', tags: ['cool', 'summer'] },
      { emoji: '🤔', name: 'thinking_face', category: 'smileys', tags: ['think', 'hmm'] },
      { emoji: '😢', name: 'crying_face', category: 'smileys', tags: ['sad', 'cry', 'tear'] },
      { emoji: '😭', name: 'loudly_crying_face', category: 'smileys', tags: ['sad', 'cry', 'sob'] },
      { emoji: '😡', name: 'pouting_face', category: 'smileys', tags: ['angry', 'mad', 'rage'] },
      { emoji: '😱', name: 'face_screaming_fear', category: 'smileys', tags: ['scared', 'fear', 'shock'] },
      { emoji: '👍', name: 'thumbs_up', category: 'people', tags: ['yes', 'approve', 'like'] },
      { emoji: '👎', name: 'thumbs_down', category: 'people', tags: ['no', 'disapprove', 'dislike'] },
      { emoji: '👏', name: 'clapping_hands', category: 'people', tags: ['applause', 'praise'] },
      { emoji: '🙌', name: 'raising_hands', category: 'people', tags: ['celebrate', 'hooray'] },
      { emoji: '🙏', name: 'folded_hands', category: 'people', tags: ['pray', 'thanks', 'please'] },
      { emoji: '💪', name: 'flexed_biceps', category: 'people', tags: ['strong', 'muscle', 'workout'] },
      { emoji: '🔥', name: 'fire', category: 'symbols', tags: ['hot', 'lit', 'flame'] },
      { emoji: '✨', name: 'sparkles', category: 'symbols', tags: ['shine', 'magic', 'stars'] },
      { emoji: '❤️', name: 'red_heart', category: 'symbols', tags: ['love', 'heart', 'red'] },
      { emoji: '💯', name: 'hundred_points', category: 'symbols', tags: ['100', 'perfect', 'score'] },
      { emoji: '🎉', name: 'party_popper', category: 'objects', tags: ['party', 'celebrate', 'confetti'] },
      { emoji: '🚀', name: 'rocket', category: 'objects', tags: ['space', 'launch', 'fast'] },
      { emoji: '💻', name: 'laptop', category: 'objects', tags: ['computer', 'tech', 'work'] },
      { emoji: '📱', name: 'mobile_phone', category: 'objects', tags: ['phone', 'mobile', 'smartphone'] },
      { emoji: '⌚', name: 'watch', category: 'objects', tags: ['time', 'clock', 'wearable'] },
      { emoji: '🎵', name: 'musical_note', category: 'objects', tags: ['music', 'song', 'note'] },
      { emoji: '🐶', name: 'dog_face', category: 'animals', tags: ['dog', 'pet', 'animal'] },
      { emoji: '🐱', name: 'cat_face', category: 'animals', tags: ['cat', 'pet', 'animal'] },
      { emoji: '🦊', name: 'fox_face', category: 'animals', tags: ['fox', 'animal'] },
      { emoji: '🦁', name: 'lion_face', category: 'animals', tags: ['lion', 'animal'] },
      { emoji: '🍕', name: 'pizza', category: 'food', tags: ['pizza', 'food', 'slice'] },
      { emoji: '🍔', name: 'hamburger', category: 'food', tags: ['burger', 'food', 'fast'] },
      { emoji: '☕', name: 'hot_beverage', category: 'food', tags: ['coffee', 'tea', 'drink'] },
      { emoji: '🍺', name: 'beer_mug', category: 'food', tags: ['beer', 'drink', 'alcohol'] },
      { emoji: '🇺🇸', name: 'flag_usa', category: 'flags', tags: ['usa', 'america', 'flag'] },
      { emoji: '🇬🇧', name: 'flag_uk', category: 'flags', tags: ['uk', 'britain', 'flag'] },
      { emoji: '🇩🇪', name: 'flag_germany', category: 'flags', tags: ['germany', 'de', 'flag'] },
      { emoji: '🇫🇷', name: 'flag_france', category: 'flags', tags: ['france', 'fr', 'flag'] },
      { emoji: '🇯🇵', name: 'flag_japan', category: 'flags', tags: ['japan', 'jp', 'flag'] }
    ];

    return emojiData;
  }

  search(query) {
    if (!query) {
      return this.emojiList.slice(0, 50);
    }

    const lowerQuery = query.toLowerCase();
    return this.emojiList
      .filter(e => 
        e.name.toLowerCase().includes(lowerQuery) ||
        e.category.includes(lowerQuery) ||
        e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 50);
  }

  getAll() {
    return this.emojiList;
  }

  getByCategory(category) {
    return this.emojiList.filter(e => e.category === category);
  }

  getCategories() {
    return [...new Set(this.emojiList.map(e => e.category))];
  }
}

module.exports = new EmojiService();
