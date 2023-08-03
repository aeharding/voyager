//
//  SavePost.swift
//  watchapp Watch App
//
//  Created by Alexander Harding on 8/2/23.
//

import Foundation

struct SavePost: Codable {
    let post_id: Int
    let save: Bool
    let auth: String
}
