//
//  Post.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import Foundation

struct Post: Codable, Identifiable {
    let id: Int
    let name: String
    let url: String?
    let body: String?
    let thumbnailUrl: String?
}
