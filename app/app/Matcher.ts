import { IProduct } from './IProduct';
import { Ingredient } from './ingredient.model';
import { Recipe } from './recipe.model';

export class Matcher {

  private products: IProduct[] = [];
  // key being word, value being the indices of product with that word in the title
  private productWordsHash: { [key: string]: number[] } = {};
  // Contains words that are to be removed as match possibilities, 
  // only added if ingredient contains a key
  private blockWords: { [key: string]: number[] } = {
    anchovies: [],
    tuna: [],
    drink: [],
    pickled: [],
    hummus: [],
    juice: [],
    ham: [],
    bacon: [],
    sausages: [],
    chocolate: [],
    cocktail: [],
  };

  constructor(products: IProduct[]) {
    this.products = products;
    this.productWordsHash = this.createProductWordsHash(this.products);
  }

  matchProducts(input: Ingredient | Recipe | Recipe[]) {
    const matchIngredient = (input: Ingredient) => {
      for (let product of this.matchIngredientToProduct(input)) {
        input.addToMatchedProducts(product);
      }
    };
    const matchRecipe = (input: Recipe) => {
      for (let ingredient of input.ingredients) {
        matchIngredient(ingredient);
      }
    };
    if (input instanceof Ingredient) {
      matchIngredient(input);
    }
    if (input instanceof Recipe) {
      matchRecipe(input);
    }
    if (input instanceof Array) {
      if (input[0] instanceof Recipe) {
        for (let recipe of input) {
          matchRecipe(recipe);
        }
      }
    }
  }

  /* 
 Creates map of all unique words in product titles, the
 key is the unique word, while the values are the array 
 indices of the product that has corresponding word.
 Consider 
  */
  private createProductWordsHash(products: IProduct[]): { [key: string]: number[] } {
    let wordMap: { [key: string]: number[] } = {};
    for (let i = 0; i < products.length; i++) {
      let words = new Set(products[i].title.trim().toLowerCase().split(' '));
      for (let word of words) {
        wordMap[word] ? wordMap[word].push(i) : wordMap[word] = [i];
      }
    }
    // Would be cleaner to store words as a linked list, though would mean space
    // doubles. 
    for (let blockWord of Object.keys(this.blockWords)) {
      if (wordMap[blockWord] !== undefined) {
        this.blockWords[blockWord] = wordMap[blockWord];
        for (let id of wordMap[blockWord]) {
          for (let word of products[id].title.trim().toLowerCase().split(' ')) {
            wordMap[word].splice(wordMap[word].indexOf(id), 1);
          }
        }
        delete wordMap[blockWord];
      }
    }
    return wordMap;
  }

  private matchIngredientToProduct(ingredient: Ingredient): IProduct[] {
    const words = ingredient.parsedText.trim().toLowerCase().split(' ');
    // const productsDictionary: { [key: string]: number[] } = {};
    const ignoreWords: { [key: string]: number } = {
      cooked: 1, block: 1, bunch: 1,
      white: 1, packs: 1,
      of: 1, pack: 1, flat: 1,
      vegetarian: 1, a: 1, seeds: 1,
      small: 1, mediterranean: 1,
      brown: 1, black: 1, green: 1,
      baby: 1, steamed: 1, fresh: 1,
      whole: 1, canned: 1, frozen: 1,
      dried: 1, strong: 1, ball: 1,
      powder: 1, hot: 1, leaves: 1,
      roasted: 1, mixed: 1, sauce: 1,
      thai: 1, pouch: 1, creme: 1,
      vegetable: 1, sweet: 1, light: 1,
      curry: 1, and: 1, paste: 1,
      juice: 1, sticks: 1, ground: 1,
      tub: 1, chopped: 1, thick: 1,
    };
    const transformWord: { [key: string]: string } = {
      onion: 'onions', potato: 'potatoes', lemon: 'lemons',
      orange: 'oranges', mushroom: 'mushrooms', lime: 'limes',
      honey: 'liquid honey', bulb: 'bulbs'
    }
    const getWordScore = (word: string): number => {
      if (ignoreWords[word] !== undefined) {
        return 0.4;
      }
      else return 1;
    }
    const getBlockedIDScore = (id: number): number => {
      let productWords = this.products[id].title.trim().toLowerCase().split(' ');
      let score = 0;
      for (const word of words) {
        if (productWords.includes(word)) {
          score += getWordScore(word);
        }
      }
      return score;
    }
    let scoreHash: { [key: number]: number } = {};
    // O(words = n)
    for (let word of words) {
      if (transformWord[word] !== undefined) {
        word = transformWord[word];
      }
      // products dictionary is dict of words with value being array 
      // index of product
      // O(n)
      if (this.productWordsHash[word] !== undefined) {
        // O(m) ergo O(n*m) 
        let wordScore = getWordScore(word);
        for (let id of this.productWordsHash[word]) {
          // O(m) ergo O(n*m+m+m)
          scoreHash[id] ? scoreHash[id] = scoreHash[id] + wordScore : scoreHash[id] = wordScore;
        }
      } else if (this.blockWords[word] !== undefined) {
        for (let id of this.blockWords[word]) {
          scoreHash[id] = getBlockedIDScore(id);
        }
      }
    }
    let sortedList = Object.entries(scoreHash).sort((a, b) => b[1] - a[1]);
    const matchLength = sortedList.length < 10 ? sortedList.length : 10;
    let goodIndex = (): number => {
      if (sortedList[matchLength][1] !== sortedList[0][1]) {
        let index = sortedList.findIndex((a, index) => a[index][0] !== a[0][0]);
        return index;
      } else return matchLength;
    };
    let matchedProducts: IProduct[] = [];
    for (let i = 0; i < matchLength; i++) {
      matchedProducts.push(this.products[sortedList[i][0]])
    };
    return matchedProducts;
  }

}