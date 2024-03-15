import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  public posts: Post[] = [];
  public tag: string = '';
  public sortBy: string = 'id';
  public direction: boolean = true;
  public errorMessage: string = "";

  public baseUrlFix = 'https://localhost:7216/'

  public sortOptions: string[] = ['id', 'reads', 'likes', 'popularity'];

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {}

  ngOnInit(): void {
    let params = `posts?tag=tech,science,culture,politics,health,startups`;
    this.http.get<Post[]>(this.baseUrlFix + params).subscribe(posts => {
       this.posts = posts;
    }, error => this.errorMessage = "Invalid Parameters: " + error.message);
  }

  //TODO: Error handling display body of message from backend containing error message 
  getPosts(): void {
    let params = `posts?tag=${this.tag}&sortBy=${this.sortBy}&direction=${this.direction ? 'asc' : 'desc'}`;
    this.http.get<Post[]>(this.baseUrlFix + params).subscribe(posts => {
      this.posts = posts;
      
    }, error => this.errorMessage = "Invalid Parameters: " + error.message);
  }

  refreshPosts(): void {
    this.errorMessage = "";
    this.getPosts();
  }
}

interface Post {
  id: number;
  author: string;
  authorId: number;
  likes: number;
  popularity: number;
  reads: number;
  tags: string[];
}
