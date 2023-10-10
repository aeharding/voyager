//
//  GetPostsResponse.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import Foundation

struct GetPostsResponse: Codable {
  let posts: [PostView]
}
