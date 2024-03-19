import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

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
    this.http.get<Post[]>(this.baseUrlFix + params)
    .pipe(catchError(err => this.handleError(err)))
    .subscribe(posts => {
       this.posts = posts;
    });
  }

  getPosts(): void {
    let params = `posts?tag=${this.tag}&sortBy=${this.sortBy}&direction=${this.direction ? 'asc' : 'desc'}`;
    this.http.get<Post[]>(this.baseUrlFix + params)
    .pipe(catchError(err => this.handleError(err)))
    .subscribe(posts => {
      this.posts = posts;
      
    });
  }

  refreshPosts(): void {
    this.errorMessage = "";
    this.getPosts();
  }

  private handleError(error: HttpError): Observable<any>{

    this.errorMessage += error.error.title + " ";

    let validationErrors = error.error.errors;

    if(validationErrors.tag != null && validationErrors.tag.length > 0)
      this.errorMessage += validationErrors.tag[0];
    else if(validationErrors.validation != null && validationErrors.validation.length > 0)
      {
        validationErrors.validation.forEach(error => {
          this.errorMessage += error;
        });  
      }

  
    return throwError(error);
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

interface HttpError {
  error: DotNetError;
}

interface DotNetError {
  type: string;
  title: string;
  status: number;
  traceId: string;
  errors: {tag: string[], validation: string[]};
}
