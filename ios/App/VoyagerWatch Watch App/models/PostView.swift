//
//  PostView.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import Foundation

struct PostView: Codable, Identifiable {
    var id: Int {
        post.id
    }

    let post: Post
    let saved: Bool
}
